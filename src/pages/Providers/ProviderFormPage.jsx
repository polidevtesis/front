import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Grid, Alert, CircularProgress,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { providerApi } from '../../api/providerApi';
import PageHeader from '../../components/common/PageHeader';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import SnackbarAlert from '../../components/common/SnackbarAlert';

const EMPTY = { name: '', contactName: '', phone: '', email: '' };

export default function ProviderFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm]     = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [snack, setSnack]     = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!isEdit) return;
    providerApi.getById(id)
      .then(p => setForm({ name: p.name, contactName: p.contactName || '', phone: p.phone || '', email: p.email || '' }))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await providerApi.update(id, form);
        setSnack({ open: true, message: 'Proveedor actualizado', severity: 'success' });
      } else {
        await providerApi.create(form);
        setSnack({ open: true, message: 'Proveedor creado', severity: 'success' });
        setTimeout(() => navigate('/providers'), 1200);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <Box>
      <PageHeader title={isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="Nombre empresa" name="name" value={form.name} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Nombre contacto" name="contactName" value={form.contactName} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Teléfono" name="phone" value={form.phone} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/providers')}>Volver</Button>
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
