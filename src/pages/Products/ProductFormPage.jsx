import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Grid, Alert,
  Autocomplete, Chip, CircularProgress, InputAdornment,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { providerApi } from '../../api/providerApi';
import PageHeader from '../../components/common/PageHeader';
import SnackbarAlert from '../../components/common/SnackbarAlert';

const EMPTY = {
  sku: '', name: '', description: '', unitPrice: '', costPrice: '',
  stock: 0, minStock: 5, unit: '', categoryIds: [], providerIds: [],
};

export default function ProductFormPage() {
  const navigate = useNavigate();
  const [form, setForm]           = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders]   = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);
  const [selectedProvs, setSelectedProvs] = useState([]);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [snack, setSnack]         = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    categoryApi.getAll().then(setCategories).catch(() => {});
    providerApi.getAll({ size: 200 }).then(r => setProviders(r.content ?? [])).catch(() => {});
  }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        unitPrice:   parseFloat(form.unitPrice),
        costPrice:   parseFloat(form.costPrice),
        stock:       parseInt(form.stock, 10),
        minStock:    parseInt(form.minStock, 10),
        categoryIds: selectedCats.map(c => c.id),
        providerIds: selectedProvs.map(p => p.id),
      };
      await productApi.create(payload);
      setSnack({ open: true, message: 'Producto creado exitosamente', severity: 'success' });
      setTimeout(() => navigate('/products'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Nuevo Producto" />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
                <TextField
                  fullWidth required label="Precio venta" name="unitPrice" type="number"
                  value={form.unitPrice} onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth required label="Precio costo" name="costPrice" type="number"
                  value={form.costPrice} onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField fullWidth label="Stock inicial" name="stock" type="number" value={form.stock} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField fullWidth label="Stock mínimo" name="minStock" type="number" value={form.minStock} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField fullWidth label="Unidad" name="unit" value={form.unit} onChange={handleChange} placeholder="ej. pieza" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  multiple options={categories} getOptionLabel={o => o.name}
                  value={selectedCats} onChange={(_, v) => setSelectedCats(v)}
                  renderTags={(v, p) => v.map((o, i) => <Chip key={o.id} label={o.name} size="small" {...p({ index: i })} />)}
                  renderInput={params => <TextField {...params} label="Categorías" />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  multiple options={providers} getOptionLabel={o => o.name}
                  value={selectedProvs} onChange={(_, v) => setSelectedProvs(v)}
                  renderTags={(v, p) => v.map((o, i) => <Chip key={o.id} label={o.name} size="small" {...p({ index: i })} />)}
                  renderInput={params => <TextField {...params} label="Proveedores" />}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/products')}>
                Volver
              </Button>
              <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />} disabled={saving}>
                Guardar
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
      <SnackbarAlert {...snack} onClose={() => setSnack(s => ({ ...s, open: false }))} />
    </Box>
  );
}
