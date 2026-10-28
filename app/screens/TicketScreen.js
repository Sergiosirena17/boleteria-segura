import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getQr } from '../api';
import { colors, formatDate } from '../theme';

export default function TicketScreen({ ticket }) {
  const [token, setToken] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Pide un QR nuevo cada vez que se acaba la ventana de 30 s
  useEffect(() => {
    if (!ticket || secondsLeft > 0) return;
    getQr(ticket.id).then((qr) => {
      setToken(qr.token);
      setSecondsLeft(qr.secondsLeft);
    });
  }, [ticket, secondsLeft]);

  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!ticket) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Aún no tienes entradas</Text>
        <Text style={styles.muted}>Compra una en Explorar y aparecerá aquí.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Entrada</Text>
        <Text style={styles.headerSub}>{ticket.event.name}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.qrBox}>
          {token && <QRCode value={token} size={190} color={colors.text} />}
        </View>
        <Text style={styles.countdown}>
          ● Se renueva en <Text style={{ fontWeight: '700' }}>{secondsLeft} s</Text>
        </Text>
        <View style={styles.details}>
          <Row label="Fecha" value={formatDate(ticket.event.date)} />
          <Row label="Lugar" value={ticket.event.venue} />
          <Row label="Titular" value={ticket.holder} />
          <Row label="Código" value={ticket.id} />
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓ Ligada a tu dispositivo</Text>
        </View>
      </View>
    </View>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 6 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  header: { backgroundColor: colors.green, padding: 20, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSub: { color: '#D6EBE0', marginTop: 4 },
  body: { padding: 16, alignItems: 'center', gap: 14 },
  qrBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1E6E3',
    minHeight: 222,
    minWidth: 222,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdown: { color: colors.green },
  details: { alignSelf: 'stretch', backgroundColor: '#fff', borderRadius: 12, padding: 14, gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  muted: { color: colors.muted },
  value: { color: colors.text, fontWeight: '600', textTransform: 'capitalize' },
  badge: { backgroundColor: colors.greenLight, borderRadius: 10, paddingVertical: 10, alignSelf: 'stretch', alignItems: 'center' },
  badgeText: { color: colors.green, fontWeight: '700' },
});
