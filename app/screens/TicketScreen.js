import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getQr } from '../api';
import { colors, formatDate } from '../theme';

export default function TicketScreen({ ticket, onBack }) {
  const [token, setToken] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const isPaid = ticket?.payment?.status === 'paid' || ticket?.payment?.status === 'released';

  useEffect(() => {
    if (!ticket || !isPaid || secondsLeft > 0) return;
    getQr(ticket.id)
      .then((qr) => { setToken(qr.token); setSecondsLeft(qr.secondsLeft); })
      .catch(() => {});
  }, [ticket, isPaid, secondsLeft]);

  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!ticket) return null;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {onBack && (
            <Pressable onPress={onBack}>
              <Text style={styles.backBtn}>&lt; Volver</Text>
            </Pressable>
          )}
          <Text style={styles.headerTitle}>Mi Entrada</Text>
          <View style={{ width: 60 }} />
        </View>
        <Text style={styles.headerSub}>{ticket.event?.name ?? 'Evento'}</Text>
      </View>
      <View style={styles.body}>
        {ticket.used ? (
          <View style={styles.usedBox}>
            <Text style={styles.usedText}>ENTRADA YA USADA</Text>
          </View>
        ) : !isPaid ? (
          <View style={styles.pendingBox}>
            <Text style={styles.pendingText}>PAGO PENDIENTE</Text>
          </View>
        ) : (
          <>
            <View style={styles.qrBox}>
              {token && <QRCode value={token} size={190} color={colors.text} />}
            </View>
            <Text style={styles.countdown}>
              Se renueva en <Text style={{ fontWeight: '700' }}>{secondsLeft} s</Text>
            </Text>
          </>
        )}
        <View style={styles.details}>
          <Row label="Fecha" value={formatDate(ticket.event?.date)} />
          <Row label="Lugar" value={ticket.event?.venue ?? ''} />
          <Row label="Titular" value={ticket.holder} />
          <Row label="Código" value={ticket.id} />
        </View>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>Ligada a tu dispositivo</Text>
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
  header: { backgroundColor: colors.green, padding: 20, alignItems: 'center' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSub: { color: '#D6EBE0', marginTop: 4 },
  backBtn: { color: '#D6EBE0', fontSize: 15, fontWeight: '600' },
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
  usedBox: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  usedText: { color: '#E65100', fontWeight: '700', fontSize: 16 },
  pendingBox: {
    backgroundColor: '#FFF8E1',
    padding: 20,
    borderRadius: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  pendingText: { color: '#F57F17', fontWeight: '700', fontSize: 16 },
  details: { alignSelf: 'stretch', backgroundColor: '#fff', borderRadius: 12, padding: 14, gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  muted: { color: colors.muted },
  value: { color: colors.text, fontWeight: '600', textTransform: 'capitalize' },
  badgeContainer: { backgroundColor: colors.greenLight, borderRadius: 10, paddingVertical: 10, alignSelf: 'stretch', alignItems: 'center' },
  badgeText: { color: colors.green, fontWeight: '700' },
});
