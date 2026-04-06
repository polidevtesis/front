import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow,
  TablePagination, Alert, TextField, MenuItem, Chip,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { movementApi } from '../../api/movementApi';
import PageHeader from '../../components/common/PageHeader';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { formatDateTime, movementTypeLabel, movementTypeColor } from '../../utils/formatters';

const TYPES = ['', 'INPUT', 'OUTPUT', 'ADJUSTMENT'];

export default function MovementListPage() {
  const navigate = useNavigate();
  const [page, setPage]   = useState(0);
  const [data, setData]   = useState({ content: [], totalElements: 0 });
  const [type, setType]   = useState('');
  const [from, setFrom]   = useState(null);
  const [to, setTo]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, size: 25, sort: 'movedAt,desc' };
      if (type) params.type = type;
      if (from) params.from = from.toISOString();
      if (to)   params.to   = to.toISOString();
      setData(await movementApi.search(params));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, type, from, to]);

  useEffect(() => { load(); }, [load]);

  return (
    <Box>
      <PageHeader title="Movimientos de Inventario"
        action={{ label: 'Registrar entrada', icon: <Add />, onClick: () => navigate('/movements/new') }} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField select size="small" label="Tipo" value={type} onChange={e => { setType(e.target.value); setPage(0); }} sx={{ minWidth: 160 }}>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="INPUT">Entrada</MenuItem>
          <MenuItem value="OUTPUT">Salida</MenuItem>
          <MenuItem value="ADJUSTMENT">Ajuste</MenuItem>
        </TextField>
        <DatePicker label="Desde" value={from} onChange={v => { setFrom(v); setPage(0); }} slotProps={{ textField: { size: 'small' } }} />
        <DatePicker label="Hasta" value={to}   onChange={v => { setTo(v);   setPage(0); }} slotProps={{ textField: { size: 'small' } }} />
      </Box>

      <Card>
        {loading ? <LoadingOverlay /> : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell>Referencia</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.content.map(m => (
                  <TableRow key={m.id} hover>
                    <TableCell>{formatDateTime(m.movedAt)}</TableCell>
                    <TableCell>
                      <Chip label={movementTypeLabel(m.type)} color={movementTypeColor(m.type)} size="small" />
                    </TableCell>
                    <TableCell>{m.productName} <code style={{ fontSize: 11 }}>({m.productSku})</code></TableCell>
                    <TableCell align="right">{m.quantity}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{m.reason || '—'}</TableCell>
                    <TableCell>{m.reference || '—'}</TableCell>
                  </TableRow>
                ))}
                {!data.content.length && (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay movimientos</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination component="div" count={data.totalElements} page={page} rowsPerPage={25}
              onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[25]}
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`} />
          </>
        )}
      </Card>
    </Box>
  );
}
