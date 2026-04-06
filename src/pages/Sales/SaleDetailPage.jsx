import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableHead, TableRow, Button, Alert, Grid, Chip,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { saleApi } from '../../api/saleApi';
import PageHeader from '../../components/common/PageHeader';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function SaleDetailPage() {
  const { id }  = useParams();
  const navigate = useNavigate();
  const [sale, setSale]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    saleApi.getById(id)
      .then(setSale)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingOverlay />;
  if (error)   return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <PageHeader title={`Venta #${sale.id}`} subtitle={formatDateTime(sale.saleDate)} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Productos</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>SKU</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Precio unit.</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sale.items.map(i => (
                    <TableRow key={i.id}>
                      <TableCell><code>{i.productSku}</code></TableCell>
                      <TableCell>{i.productName}</TableCell>
                      <TableCell align="right">{formatCurrency(i.unitPrice)}</TableCell>
                      <TableCell align="right">{i.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(i.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="h6" gutterBottom>Resumen</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Número de venta</Typography>
                <Typography fontWeight={600}>#{sale.id}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Fecha</Typography>
                <Typography>{formatDateTime(sale.saleDate)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Items</Typography>
                <Typography>{sale.items.length}</Typography>
              </Box>
              {sale.notes && (
                <Box>
                  <Typography color="text.secondary" gutterBottom>Notas</Typography>
                  <Typography variant="body2">{sale.notes}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">{formatCurrency(sale.totalAmount)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/sales')}>Volver</Button>
      </Box>
    </Box>
  );
}
