import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow,
  TablePagination, IconButton, Tooltip, Alert, TextField,
} from '@mui/material';
import { Add, Visibility, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { saleApi } from '../../api/saleApi';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SnackbarAlert from '../../components/common/SnackbarAlert';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function SaleListPage() {
  const navigate = useNavigate();
  const [page, setPage]     = useState(0);
  const [data, setData]     = useState({ content: [], totalElements: 0 });
  const [from, setFrom]     = useState(null);
  const [to, setTo]         = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [snack, setSnack]   = useState({ open: false, message: '', severity: 'success' });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, size: 20, sort: 'saleDate,desc' };
      if (from) params.from = from.toISOString();
      if (to)   params.to   = to.toISOString();
      setData(await saleApi.getAll(params));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, from, to]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async () => {
    try {
      await saleApi.cancel(cancelTarget.id);
      setSnack({ open: true, message: 'Venta cancelada', severity: 'success' });
      load();
    } catch (err) {
      setSnack({ open: true, message: err.message, severity: 'error' });
    } finally {
      setCancelTarget(null);
    }
  };

  return (
    <Box>
      <PageHeader title="Ventas" action={{ label: 'Nueva venta', icon: <Add />, onClick: () => navigate('/sales/new') }} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <DatePicker label="Desde" value={from} onChange={setFrom} slotProps={{ textField: { size: 'small' } }} />
        <DatePicker label="Hasta" value={to}   onChange={setTo}   slotProps={{ textField: { size: 'small' } }} />
      </Box>

      <Card>
        {loading ? <LoadingOverlay /> : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Notas</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.content.map(s => (
                  <TableRow key={s.id} hover>
                    <TableCell>{s.id}</TableCell>
                    <TableCell>{formatDateTime(s.saleDate)}</TableCell>
                    <TableCell>{s.items?.length ?? 0}</TableCell>
                    <TableCell align="right">{formatCurrency(s.totalAmount)}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', maxWidth: 180 }}>{s.notes || '—'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalle">
                        <IconButton size="small" onClick={() => navigate(`/sales/${s.id}`)}><Visibility fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Cancelar venta">
                        <IconButton size="small" color="error" onClick={() => setCancelTarget(s)}><Cancel fontSize="small" /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {!data.content.length && (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay ventas registradas</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination component="div" count={data.totalElements} page={page} rowsPerPage={20}
              onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[20]}
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`} />
          </>
        )}
      </Card>

      <ConfirmDialog open={!!cancelTarget} title="Cancelar venta" confirmColor="warning"
        message={`¿Cancelar la venta #${cancelTarget?.id}? El inventario no se revertirá.`}
        onConfirm={handleCancel} onCancel={() => setCancelTarget(null)} />
      <SnackbarAlert {...snack} onClose={() => setSnack(s => ({ ...s, open: false }))} />
    </Box>
  );
}
