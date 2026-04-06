import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow,
  TablePagination, IconButton, Tooltip, Alert,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { providerApi } from '../../api/providerApi';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SnackbarAlert from '../../components/common/SnackbarAlert';
import LoadingOverlay from '../../components/common/LoadingOverlay';

export default function ProviderListPage() {
  const navigate = useNavigate();
  const [page, setPage]   = useState(0);
  const [data, setData]   = useState({ content: [], totalElements: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snack, setSnack]   = useState({ open: false, message: '', severity: 'success' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await providerApi.getAll({ page, size: 20, sort: 'name,asc' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    try {
      await providerApi.remove(deleteTarget.id);
      setSnack({ open: true, message: 'Proveedor eliminado', severity: 'success' });
      load();
    } catch (err) {
      setSnack({ open: true, message: err.message, severity: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Box>
      <PageHeader title="Proveedores" action={{ label: 'Nuevo proveedor', icon: <Add />, onClick: () => navigate('/providers/new') }} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Card>
        {loading ? <LoadingOverlay /> : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Contacto</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.content.map(p => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.contactName || '—'}</TableCell>
                    <TableCell>{p.phone || '—'}</TableCell>
                    <TableCell>{p.email || '—'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => navigate(`/providers/${p.id}`)}><Edit fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(p)}><Delete fontSize="small" /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {!data.content.length && (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay proveedores registrados</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div" count={data.totalElements} page={page} rowsPerPage={20}
              onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[20]}
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            />
          </>
        )}
      </Card>
      <ConfirmDialog open={!!deleteTarget} title="Eliminar proveedor"
        message={`¿Eliminar "${deleteTarget?.name}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      <SnackbarAlert {...snack} onClose={() => setSnack(s => ({ ...s, open: false }))} />
    </Box>
  );
}
