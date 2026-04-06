import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Button, Grid, Alert, CircularProgress,
  TextField, Typography, Table, TableBody, TableCell, TableHead,
  TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, InputAdornment, Autocomplete, LinearProgress, Divider,
} from '@mui/material';
import { AutoAwesome, Lock, CheckCircle } from '@mui/icons-material';
import { aiApi } from '../../api/aiApi';
import { categoryApi } from '../../api/categoryApi';
import PageHeader from '../../components/common/PageHeader';
import { formatCurrency } from '../../utils/formatters';

export default function AiOrderPage() {
  const [categories, setCategories]   = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);
  const [budget, setBudget]           = useState('');
  const [days, setDays]               = useState(90);
  const [apiKeyDialog, setApiKeyDialog] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [result, setResult]           = useState(null);

  useEffect(() => {
    categoryApi.getAll().then(setCategories).catch(() => {});
  }, []);

  const handleRequestClick = (e) => {
    e.preventDefault();
    if (!budget || parseFloat(budget) <= 0) {
      setError('Ingresa un presupuesto válido');
      return;
    }
    setError('');
    setApiKeyDialog(true);
  };

  const handleConfirmWithKey = async () => {
    if (!apiKeyInput.trim()) return;
    const key = apiKeyInput.trim();
    setApiKeyDialog(false);
    setApiKeyInput(''); // clear immediately
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = {
        budget: parseFloat(budget),
        analysisDays: parseInt(days, 10),
        focusCategoryIds: selectedCats.length > 0 ? selectedCats.map(c => c.id) : undefined,
      };
      const data = await aiApi.getOrderRecommendation(key, payload);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Orden Recomendada por IA"
        subtitle="Claude analiza el stock actual vs ventas históricas vs presupuesto para sugerir el reabastecimiento óptimo."
      />

      <Grid container spacing={3}>
        {/* Parameters panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesome color="primary" /> Parámetros
              </Typography>
              <Box component="form" onSubmit={handleRequestClick} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  required
                  label="Presupuesto disponible"
                  type="number"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  helperText="Monto máximo para el pedido de reabastecimiento"
                />
                <TextField
                  label="Días de análisis"
                  type="number"
                  value={days}
                  onChange={e => setDays(e.target.value)}
                  inputProps={{ min: 7, max: 365 }}
                  helperText="Historial de ventas a considerar"
                />
                <Autocomplete
                  multiple
                  options={categories}
                  getOptionLabel={c => c.name}
                  value={selectedCats}
                  onChange={(_, v) => setSelectedCats(v)}
                  renderInput={params => (
                    <TextField {...params} label="Filtrar categorías" helperText="Vacío = analiza todos los productos" />
                  )}
                />

                <Alert severity="info" icon={<Lock fontSize="small" />} sx={{ mt: 1 }}>
                  Se te pedirá tu <strong>API key de Anthropic</strong> antes de ejecutar. La clave se usa solo para esta solicitud y nunca se almacena.
                </Alert>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<AutoAwesome />}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Analizando…' : 'Generar recomendación'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Results panel */}
        <Grid item xs={12} md={8}>
          {loading && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <CircularProgress size={48} sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>Claude está analizando el inventario…</Typography>
                <Typography color="text.secondary" variant="body2">Esto puede tomar unos segundos</Typography>
                <LinearProgress sx={{ mt: 3, mx: 4 }} />
              </CardContent>
            </Card>
          )}

          {error && !loading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {result && !loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Summary */}
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CheckCircle color="success" />
                    <Typography variant="h6">Resumen de la recomendación</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">Presupuesto</Typography>
                      <Typography fontWeight={600}>{formatCurrency(result.budget)}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">Costo estimado</Typography>
                      <Typography fontWeight={600} color="primary">{formatCurrency(result.totalEstimatedCost)}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">Presupuesto restante</Typography>
                      <Typography fontWeight={600} color="success.main">{formatCurrency(result.remainingBudget)}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">Modelo IA</Typography>
                      <Typography variant="body2">{result.modelUsed}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Recommendations table */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Productos a pedir ({result.recommendations?.length ?? 0})
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>SKU</TableCell>
                        <TableCell>Producto</TableCell>
                        <TableCell align="center">Stock actual</TableCell>
                        <TableCell align="center">Ventas/mes</TableCell>
                        <TableCell align="center">Cantidad sugerida</TableCell>
                        <TableCell align="right">Costo est.</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.recommendations?.map(r => (
                        <TableRow key={r.productId}>
                          <TableCell><code>{r.productSku}</code></TableCell>
                          <TableCell>
                            <Typography variant="body2">{r.productName}</Typography>
                            <Typography variant="caption" color="text.secondary">{r.justification}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={r.currentStock}
                              size="small"
                              color={r.currentStock <= r.minStock ? 'error' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="center">{r.avgMonthlySales?.toFixed(1) ?? '—'}</TableCell>
                          <TableCell align="center">
                            <Chip label={r.suggestedOrderQty} size="small" color="primary" />
                          </TableCell>
                          <TableCell align="right">{formatCurrency(r.estimatedCost)}</TableCell>
                        </TableRow>
                      ))}
                      {!result.recommendations?.length && (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                            Claude no encontró productos que requieran reabastecimiento con el presupuesto dado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Box>
          )}

          {!result && !loading && !error && (
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                <AutoAwesome sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                <Typography variant="h6">Configura los parámetros y genera tu primera recomendación</Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* API Key dialog — secure, modal, key cleared on close */}
      <Dialog open={apiKeyDialog} onClose={() => { setApiKeyDialog(false); setApiKeyInput(''); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Lock color="primary" /> Ingresa tu API key de Anthropic
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Esta clave se usará <strong>únicamente</strong> para esta solicitud y no se guardará en ningún lugar.
            Puedes obtenerla en <strong>console.anthropic.com</strong>.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label="API Key"
            type="password"
            value={apiKeyInput}
            onChange={e => setApiKeyInput(e.target.value)}
            placeholder="sk-ant-..."
            onKeyDown={e => { if (e.key === 'Enter') handleConfirmWithKey(); }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setApiKeyDialog(false); setApiKeyInput(''); }}>Cancelar</Button>
          <Button
            variant="contained"
            startIcon={<AutoAwesome />}
            onClick={handleConfirmWithKey}
            disabled={!apiKeyInput.trim()}
          >
            Ejecutar análisis
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
