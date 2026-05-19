export function formatCurrency(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(dateValue) {
  if (!dateValue) return '—';

  let date;
  if (Array.isArray(dateValue)) {
    // Jackson puede serializar LocalDateTime como array [year, month, day, h, m, s, nano]
    const [y, mo, d, h = 0, mi = 0, s = 0] = dateValue;
    date = new Date(y, mo - 1, d, h, mi, s);
  } else {
    // String ISO: truncar fracciones de segundo a 3 dígitos (JS solo soporta ms)
    // y agregar 'Z' solo si no tiene info de zona horaria
    const str = String(dateValue).replace(/(\.\d{3})\d+/, '$1');
    const hasOffset = str.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(str);
    date = new Date(hasOffset ? str : str + 'Z');
  }

  if (isNaN(date.getTime())) return '—';

  return date.toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
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
