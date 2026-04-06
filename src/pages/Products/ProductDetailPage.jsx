import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Grid, Alert,
  Autocomplete, Chip, CircularProgress, InputAdornment,
  Typography, Table, TableBody, TableCell, TableHead, TableRow, Tabs, Tab,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { providerApi } from '../../api/providerApi';
import { dashboardApi } from '../../api/dashboardApi';
import PageHeader from '../../components/common/PageHeader';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import SnackbarAlert from '../../components/common/SnackbarAlert';
import { formatCurrency, formatDateTime, movementTypeLabel, movementTypeColor } from '../../utils/formatters';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab]             = useState(0);
  const [product, setProduct]     = useState(null);
  const [form, setForm]           = useState(null);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders]   = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);
  const [selectedProvs, setSelectedProvs] = useState([]);
  const [history, setHistory]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [snack, setSnack]         = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [p, cats, provs, hist] = await Promise.all([
          productApi.getById(id),
          categoryApi.getAll(),
          providerApi.getAll({ size: 200 }),
          dashboardApi.getStockHistory(id),
        ]);
        setProduct(p);
        setForm({
          sku: p.sku, name: p.name, description: p.description || '',
          unitPrice: p.unitPrice, costPrice: p.costPrice,
          stock: p.stock, minStock: p.minStock, unit: p.unit || '',
        });
        setCategories(cats);
        setProviders(provs.content ?? []);
        setSelectedCats(cats.filter(c => p.categories?.some(pc => pc.id === c.id)));
        setSelectedProvs((provs.content ?? []).filter(pr => p.providers?.some(pp => pp.id === pr.id)));

        // Build cumulative stock line from movements
        let running = 0;
        const chartData = hist.map(m => {
          running += m.type === 'OUTPUT' ? -m.quantity : m.quantity;
          return { date: new Date(m.movedAt).toLocaleDateString('es-CO'), stock: running, type: m.type };
        });
        setHistory({ movements: hist, chart: chartData });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await productApi.update(id, {
        ...form,
        unitPrice:   parseFloat(form.unitPrice),
        costPrice:   parseFloat(form.costPrice),
        stock:       parseInt(form.stock, 10),
        minStock:    parseInt(form.minStock, 10),
        categoryIds: selectedCats.map(c => c.id),
        providerIds: selectedProvs.map(p => p.id),
      });
      setSnack({ open: true, message: 'Producto actualizado', severity: 'success' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingOverlay />;
  if (!form)   return <Alert severity="error">{error || 'Producto no encontrado'}</Alert>;

  return (
    <Box>
      <PageHeader title={product.name} subtitle={`SKU: ${product.sku}`} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Información" />
        <Tab label="Historial de stock" />
      </Tabs>

      {tab === 0 && (
        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth required label="SKU" name="sku" value={form.sku} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField fullWidth required label="Nombre" name="name" value={form.name} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={2} label="Descripción" name="description" value={form.description} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth required label="Precio venta" name="unitPrice" type="number" value={form.unitPrice} onChange={handleChange}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth required label="Precio costo" name="costPrice" type="number" value={form.costPrice} onChange={handleChange}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField fullWidth label="Stock actual" name="stock" type="number" value={form.stock} onChange={handleChange} disabled helperText="Usar movimientos" />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField fullWidth label="Stock mínimo" name="minStock" type="number" value={form.minStock} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField fullWidth label="Unidad" name="unit" value={form.unit} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete multiple options={categories} getOptionLabel={o => o.name}
                    value={selectedCats} onChange={(_, v) => setSelectedCats(v)}
                    renderTags={(v, p) => v.map((o, i) => <Chip key={o.id} label={o.name} size="small" {...p({ index: i })} />)}
                    renderInput={params => <TextField {...params} label="Categorías" />} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete multiple options={providers} getOptionLabel={o => o.name}
                    value={selectedProvs} onChange={(_, v) => setSelectedProvs(v)}
                    renderTags={(v, p) => v.map((o, i) => <Chip key={o.id} label={o.name} size="small" {...p({ index: i })} />)}
                    renderInput={params => <TextField {...params} label="Proveedores" />} />
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/products')}>Volver</Button>
                <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />} disabled={saving}>Guardar</Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {history.chart?.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Evolución del stock</Typography>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={history.chart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="stepAfter" dataKey="stock" stroke="#1565C0" strokeWidth={2} dot={false} name="Stock" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Movimientos</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell>Motivo</TableCell>
                    <TableCell>Referencia</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.movements?.map(m => (
                    <TableRow key={m.id}>
                      <TableCell>{formatDateTime(m.movedAt)}</TableCell>
                      <TableCell><Chip label={movementTypeLabel(m.type)} color={movementTypeColor(m.type)} size="small" /></TableCell>
                      <TableCell align="right">{m.quantity}</TableCell>
                      <TableCell>{m.reason || '—'}</TableCell>
                      <TableCell>{m.reference || '—'}</TableCell>
                    </TableRow>
                  ))}
                  {!history.movements?.length && (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>Sin movimientos registrados</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Box>
      )}
      <SnackbarAlert {...snack} onClose={() => setSnack(s => ({ ...s, open: false }))} />
    </Box>
  );
}
