import { useState, useEffect } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Tooltip, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField, CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { categoryApi } from '../../api/categoryApi';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SnackbarAlert from '../../components/common/SnackbarAlert';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { formatDateTime } from '../../utils/formatters';

const EMPTY_FORM = { name: '', description: '' };

function CategoryDialog({ open, initial, onSave, onClose }) {
  const [form, setForm]   = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr]     = useState('');

  useEffect(() => { setForm(initial ?? EMPTY_FORM); setErr(''); }, [initial, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try { await onSave(form); } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {err && <Alert severity="error">{err}</Alert>}
          <TextField required label="Nombre" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth />
          <TextField label="Descripción" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} fullWidth multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={18} color="inherit" /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function CategoryListPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snack, setSnack]           = useState({ open: false, message: '', severity: 'success' });

  const load = async () => {
    setLoading(true);
    try { setCategories(await categoryApi.getAll()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (editTarget) {
      await categoryApi.update(editTarget.id, form);
      setSnack({ open: true, message: 'Categoría actualizada', severity: 'success' });
    } else {
      await categoryApi.create(form);
      setSnack({ open: true, message: 'Categoría creada', severity: 'success' });
    }
    setDialogOpen(false);
    setEditTarget(null);
    load();
  };

  const handleDelete = async () => {
    try {
      await categoryApi.remove(deleteTarget.id);
      setSnack({ open: true, message: 'Categoría eliminada', severity: 'success' });
      load();
    } catch (err) {
      setSnack({ open: true, message: err.message, severity: 'error' });
    } finally { setDeleteTarget(null); }
  };

  const openEdit = (c) => { setEditTarget(c); setDialogOpen(true); };
  const openNew  = ()  => { setEditTarget(null); setDialogOpen(true); };

  return (
    <Box>
      <PageHeader title="Categorías" action={{ label: 'Nueva categoría', icon: <Add />, onClick: openNew }} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Card>
        {loading ? <LoadingOverlay /> : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Creada</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map(c => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{c.description || '—'}</TableCell>
                  <TableCell>{formatDateTime(c.createdAt)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar"><IconButton size="small" onClick={() => openEdit(c)}><Edit fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => setDeleteTarget(c)}><Delete fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!categories.length && (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay categorías</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
      <CategoryDialog
        open={dialogOpen}
        initial={editTarget ? { name: editTarget.name, description: editTarget.description || '' } : null}
        onSave={handleSave}
        onClose={() => { setDialogOpen(false); setEditTarget(null); }}
      />
      <ConfirmDialog open={!!deleteTarget} title="Eliminar categoría"
        message={`¿Eliminar "${deleteTarget?.name}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      <SnackbarAlert {...snack} onClose={() => setSnack(s => ({ ...s, open: false }))} />
    </Box>
  );
}
