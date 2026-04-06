import { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, Alert,
} from '@mui/material';
import {
  Inventory2, Category, Business, PointOfSale, Warning,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { dashboardApi } from '../../api/dashboardApi';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import PageHeader from '../../components/common/PageHeader';
import { formatCurrency } from '../../utils/formatters';

const COLORS = ['#1565C0', '#1976D2', '#1E88E5', '#42A5F5', '#64B5F6', '#90CAF9'];

function StatCard({ icon, label, value, color = 'primary.main' }) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: color, color: 'white', display: 'flex' }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>{value ?? '—'}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [summary, setSummary]       = useState(null);
  const [lowStock, setLowStock]     = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [sum, low, cat, top] = await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getLowStock(),
          dashboardApi.getSalesByCategory(),
          dashboardApi.getTopProducts({ limit: 8 }),
        ]);
        setSummary(sum);
        setLowStock(low);
        setByCategory(cat.map(r => ({ name: r.categoryName, revenue: Number(r.totalRevenue) })));
        setTopProducts(top.map(r => ({ name: r.productName, qty: Number(r.totalUnitsSold) })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingOverlay />;
  if (error)   return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Resumen general del inventario" />

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<Inventory2 />} label="Productos activos" value={summary?.totalProducts} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<Category />} label="Categorías" value={summary?.totalCategories} color="secondary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<Business />} label="Proveedores" value={summary?.totalProviders} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<PointOfSale />} label="Ventas (período)" value={summary?.totalSalesPeriod} color="warning.main" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Sales by Category chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Ventas por Categoría</Typography>
              {byCategory.length === 0
                ? <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Sin datos de ventas</Typography>
                : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={byCategory} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" angle={-30} textAnchor="end" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11 }} width={80} />
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                      <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                        {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )
              }
            </CardContent>
          </Card>
        </Grid>

        {/* Top products chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Productos más vendidos</Typography>
              {topProducts.length === 0
                ? <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Sin datos de ventas</Typography>
                : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart layout="vertical" data={topProducts} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
                      <Tooltip />
                      <Bar dataKey="qty" fill="#1565C0" radius={[0, 4, 4, 0]} name="Unidades" />
                    </BarChart>
                  </ResponsiveContainer>
                )
              }
            </CardContent>
          </Card>
        </Grid>

        {/* Low stock alert */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Warning color="warning" />
                <Typography variant="h6">Productos con Stock Bajo</Typography>
                {lowStock.length > 0 && <Chip label={lowStock.length} color="warning" size="small" />}
              </Box>
              {lowStock.length === 0
                ? <Typography color="text.secondary">Todos los productos tienen stock suficiente.</Typography>
                : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>SKU</TableCell>
                        <TableCell>Producto</TableCell>
                        <TableCell align="center">Stock actual</TableCell>
                        <TableCell align="center">Stock mínimo</TableCell>
                        <TableCell>Categorías</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lowStock.map(p => (
                        <TableRow key={p.id} sx={{ backgroundColor: 'rgba(211,47,47,0.04)' }}>
                          <TableCell><code>{p.sku}</code></TableCell>
                          <TableCell>{p.name}</TableCell>
                          <TableCell align="center">
                            <Chip label={p.stock} color="error" size="small" />
                          </TableCell>
                          <TableCell align="center">{p.minStock}</TableCell>
                          <TableCell>{p.categories?.map(c => c.name).join(', ') || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )
              }
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
