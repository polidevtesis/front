export function formatCurrency(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function movementTypeLabel(type) {
  const labels = { INPUT: 'Entrada', OUTPUT: 'Salida', ADJUSTMENT: 'Ajuste' };
  return labels[type] || type;
}

export function movementTypeColor(type) {
  const colors = { INPUT: 'success', OUTPUT: 'error', ADJUSTMENT: 'warning' };
  return colors[type] || 'default';
}
