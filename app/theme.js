export const colors = {
  green: '#2E6B4F',
  greenLight: '#E3F1EA',
  bg: '#F3F5F4',
  card: '#FFFFFF',
  text: '#1B2420',
  muted: '#6B7A73',
  amber: '#E8A92E',
};

export function formatDate(iso) {
  return new Date(iso).toLocaleString('es-PE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
