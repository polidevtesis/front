import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, TextField, MenuItem, Table, TableBody,
  TableCell, TableHead, TableRow, TablePagination, Chip, IconButton,
  Tooltip, Alert, InputAdornment,
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SnackbarAlert from '../../components/common/SnackbarAlert';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { formatCurrency } from '../../utils/formatters';

export default function ProductListPage() {
  const navigate = useNavigate();
  const [page, setPage]             = useState(0);
  const [rowsPerPage]               = useState(20);
  const [data, setData]             = useState({ content: [], totalElements: 0 });
  const [categories, setCategories] = useState([]);
  const [filters, setFilters]       = useState({ name: '', sku: '', categoryId: '' });
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snack, setSnack]           = useState({ open: false, message: '', severity: 'success' });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, size: rowsPerPage, sort: 'name,asc' };
      if (filters.name)       params.name       = filters.name;
      if (filters.sku)        params.sku        = filters.sku;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      const result = await productApi.search(params);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    categoryApi.getAll().then(setCategories).catch(() => {});
  }, []);

  const handleFilterChange = (e) => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
    setPage(0);
  };

  const handleDelete = async () => {
    try {
      await productApi.remove(deleteTarget.id);
      setSnack({ open: true, message: 'Producto eliminado', severity: 'success' });
      load();
    } catch (err) {
      setSnack({ open: true, message: err.message, severity: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Productos"
        action={{ label: 'Nuevo producto', icon: <Add />, onClick: () => navigate('/products/new') }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small" name="name" label="Nombre" value={filters.name}
              onChange={handleFilterChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
              sx={{ minWidth: 200 }}
            />
            <TextField
              size="small" name="sku" label="SKU" value={filters.sku}
              onChange={handleFilterChange} sx={{ minWidth: 140 }}
            />
            <TextField
              select size="small" name="categoryId" label="Categoría" value={filters.categoryId}
              onChange={handleFilterChange} sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
          </Box>
        </CardContent>
      </Card>

      <Card>
        {loading ? <LoadingOverlay /> : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>SKU</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Categorías</TableCell>
                  <TableCell align="right">Precio venta</TableCell>
                  <TableCell align="center">Stock</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.content.map(p => (
                  <TableRow key={p.id} hover>
                    <TableCell><code>{p.sku}</code></TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>
                      {p.categories?.slice(0, 2).map(c => (
                        <Chip key={c.id} label={c.name} size="small" sx={{ mr: 0.5 }} />
                      ))}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(p.unitPrice)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={p.stock}
                        size="small"
                        color={p.lowStock ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => navigate(`/products/${p.id}`)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(p)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {data.content.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={data.totalElements}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPageOptions={[20]}
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            />
          </>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar producto"
        message={`¿Eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <SnackbarAlert {...snack} onClose={() => setSnack(s => ({ ...s, open: false }))} />
    </Box>
  );
}
