import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Button, Grid, Alert, CircularProgress,
  TextField, Autocomplete, Table, TableBody, TableCell, TableHead,
  TableRow, IconButton, Typography, Divider, InputAdornment,
} from '@mui/material';
import { Add, Delete, Save, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { saleApi } from '../../api/saleApi';
import { productApi } from '../../api/productApi';
import PageHeader from '../../components/common/PageHeader';
import SnackbarAlert from '../../components/common/SnackbarAlert';
import { formatCurrency } from '../../utils/formatters';

export default function SaleFormPage() {
  const navigate = useNavigate();
  const [products, setProducts]   = useState([]);
  const [items, setItems]         = useState([]);
  const [notes, setNotes]         = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty]             = useState(1);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [snack, setSnack]         = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    productApi.search({ size: 500 }).then(r => setProducts(r.content ?? [])).catch(() => {});
  }, []);

  const addItem = () => {
    if (!selectedProduct || qty < 1) return;
    const existing = items.find(i => i.productId === selectedProduct.id);
    if (existing) {
      setItems(items.map(i =>
        i.productId === selectedProduct.id
          ? { ...i, quantity: i.quantity + qty, subtotal: (i.quantity + qty) * i.unitPrice }
          : i
      ));
    } else {
      setItems([...items, {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        quantity: qty,
        unitPrice: parseFloat(selectedProduct.unitPrice),
        subtotal: qty * parseFloat(selectedProduct.unitPrice),
        availableStock: selectedProduct.stock,
      }]);
    }
    setSelectedProduct(null);
    setQty(1);
  };

  const removeItem = (productId) => setItems(items.filter(i => i.productId !== productId));

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) { setError('Agrega al menos un producto'); return; }
    setSaving(true);
    setError('');
    try {
      await saleApi.create({
        saleDate: new Date().toISOString(),
        notes,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      });
      setSnack({ open: true, message: 'Venta registrada', severity: 'success' });
      setTimeout(() => navigate('/sales'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Nueva Venta" />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            {/* Product selector */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-end' }}>
              <Autocomplete
                sx={{ flex: 1 }}
                options={products}
                getOptionLabel={p => `${p.sku} — ${p.name}`}
                value={selectedProduct}
                onChange={(_, v) => setSelectedProduct(v)}
                renderInput={params => <TextField {...params} label="Buscar producto" size="small" />}
                renderOption={(props, p) => (
                  <li {...props} key={p.id}>
                    <Box>
                      <Typography variant="body2">{p.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        SKU: {p.sku} | Stock: {p.stock} | {formatCurrency(p.unitPrice)}
                      </Typography>
                    </Box>
                  </li>
                )}
              />
              <TextField
                label="Cantidad" type="number" size="small" value={qty}
                onChange={e => setQty(parseInt(e.target.value, 10) || 1)}
                inputProps={{ min: 1 }} sx={{ width: 100 }}
              />
              <Button variant="outlined" startIcon={<Add />} onClick={addItem} disabled={!selectedProduct}>
                Agregar
              </Button>
            </Box>

            {/* Items table */}
            {items.length > 0 && (
              <>
                <Table size="small" sx={{ mb: 2 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>SKU</TableCell>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Precio unit.</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map(i => (
                      <TableRow key={i.productId}>
                        <TableCell><code>{i.sku}</code></TableCell>
                        <TableCell>{i.productName}</TableCell>
                        <TableCell align="right">{formatCurrency(i.unitPrice)}</TableCell>
                        <TableCell align="right">{i.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(i.subtotal)}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => removeItem(i.productId)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Typography variant="h6">Total: {formatCurrency(total)}</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
              </>
            )}

            <TextField fullWidth label="Notas (opcional)" value={notes} onChange={e => setNotes(e.target.value)} multiline rows={2} sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/sales')}>Volver</Button>
              <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />} disabled={saving || items.length === 0}>
                Registrar venta
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
      <SnackbarAlert {...snack} onClose={() => setSnack(s => ({ ...s, open: false }))} />
    </Box>
  );
}
