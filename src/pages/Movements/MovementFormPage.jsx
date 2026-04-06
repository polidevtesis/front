import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Grid, Alert,
  MenuItem, CircularProgress, Autocomplete, Typography,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { movementApi } from '../../api/movementApi';
import { productApi } from '../../api/productApi';
import PageHeader from '../../components/common/PageHeader';
import SnackbarAlert from '../../components/common/SnackbarAlert';

export default function MovementFormPage() {
  const navigate = useNavigate();
  const [products, setProducts]         = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm]                 = useState({ type: 'INPUT', quantity: 1, reason: '', reference: '' });
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');
  const [snack, setSnack]               = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    productApi.search({ size: 500 }).then(r => setProducts(r.content ?? [])).catch(() => {});
  }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) { setError('Selecciona un producto'); return; }
    setSaving(true);
    setError('');
    try {
      await movementApi.register({
        productId: selectedProduct.id,
        type: form.type,
        quantity: parseInt(form.quantity, 10),
        reason: form.reason,
        reference: form.reference,
      });
      setSnack({ open: true, message: 'Movimiento registrado', severity: 'success' });
      setTimeout(() => navigate('/movements'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Registrar Movimiento" subtitle="Solo entradas y ajustes manuales. Las salidas se generan automáticamente con cada venta." />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  options={products}
                  getOptionLabel={p => `${p.sku} — ${p.name}`}
                  value={selectedProduct}
                  onChange={(_, v) => setSelectedProduct(v)}
                  renderOption={(props, p) => (
                    <li {...props} key={p.id}>
                      <Box>
                        <Typography variant="body2">{p.name}</Typography>
                        <Typography variant="caption" color="text.secondary">SKU: {p.sku} | Stock actual: {p.stock}</Typography>
                      </Box>
                    </li>
                  )}
                  renderInput={params => <TextField {...params} required label="Producto" />}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth select required label="Tipo" name="type" value={form.type} onChange={handleChange}>
                  <MenuItem value="INPUT">Entrada (suma stock)</MenuItem>
                  <MenuItem value="ADJUSTMENT">Ajuste (suma stock)</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField fullWidth required label="Cantidad" name="quantity" type="number" value={form.quantity} onChange={handleChange} inputProps={{ min: 1 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Motivo" name="reason" value={form.reason} onChange={handleChange} placeholder="ej. Orden de compra #123" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Referencia" name="reference" value={form.reference} onChange={handleChange} placeholder="ej. PO-2026-001" />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/movements')}>Volver</Button>
              <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />} disabled={saving}>
                Registrar
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
      <SnackbarAlert {...snack} onClose={() => setSnack(s => ({ ...s, open: false }))} />
    </Box>
  );
}
