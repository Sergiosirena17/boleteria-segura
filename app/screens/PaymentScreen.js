import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { confirmPayment } from '../api';
import { colors } from '../theme';

export default function PaymentScreen({ ticket, onPaid, onCancel }) {
  const [method, setMethod] = useState('yape');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function pay() {
    setLoading(true);
    setError(null);
    try {
      await confirmPayment(ticket.payment.id, method);
      onPaid({ ...ticket, payment: { ...ticket.payment, status: 'paid', method } });
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Confirmar pago</Text>
      </View>

      <View style={s.card}>
        <Text style={s.eventName}>{ticket.event?.name}</Text>
        <Text style={s.venue}>{ticket.event?.venue}</Text>
        <View style={s.priceRow}>
          <Text style={s.priceLabel}>Total</Text>
          <Text style={s.price}>S/ {ticket.payment?.amount?.toFixed(2)}</Text>
        </View>
      </View>

      <Text style={s.methodTitle}>Método de pago</Text>

      <Pressable
        style={[s.methodBtn, method === 'yape' && s.methodSelected]}
        onPress={() => setMethod('yape')}
      >
        <Text style={s.methodIcon}>📱</Text>
        <View>
          <Text style={s.methodName}>Yape</Text>
          <Text style={s.methodDesc}>Pago con código QR</Text>
        </View>
      </Pressable>

      <Pressable
        style={[s.methodBtn, method === 'mercadopago' && s.methodSelected]}
        onPress={() => setMethod('mercadopago')}
      >
        <Text style={s.methodIcon}>💳</Text>
        <View>
          <Text style={s.methodName}>Mercado Pago</Text>
          <Text style={s.methodDesc}>Tarjeta o saldo</Text>
        </View>
      </Pressable>

      {error && <Text style={s.error}>{error}</Text>}

      <View style={s.escrowNote}>
        <Text style={s.escrowText}>
          Tu dinero queda retenido hasta que ingreses al evento. Si no vas, se te devuelve.
        </Text>
      </View>

      <Pressable style={s.payBtn} onPress={pay} disabled={loading}>
        <Text style={s.payBtnText}>
          {loading ? 'Procesando...' : `Pagar con ${method === 'yape' ? 'Yape' : 'Mercado Pago'}`}
        </Text>
      </Pressable>

      <Pressable onPress={onCancel}>
        <Text style={s.cancel}>Cancelar</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  header: { paddingVertical: 12 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    gap: 4,
  },
  eventName: { fontSize: 17, fontWeight: '700', color: colors.text },
  venue: { color: colors.muted, fontSize: 14 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E1E6E3',
  },
  priceLabel: { color: colors.muted, fontSize: 15 },
  price: { fontSize: 22, fontWeight: '700', color: colors.green },
  methodTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 10 },
  methodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E1E6E3',
  },
  methodSelected: { borderColor: colors.green },
  methodIcon: { fontSize: 28 },
  methodName: { fontSize: 15, fontWeight: '700', color: colors.text },
  methodDesc: { fontSize: 13, color: colors.muted },
  error: { color: '#B3261E', marginVertical: 8, textAlign: 'center' },
  escrowNote: {
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 14,
    marginVertical: 16,
  },
  escrowText: { fontSize: 13, color: '#7A6C3A', lineHeight: 18 },
  payBtn: {
    backgroundColor: colors.green,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancel: { color: colors.muted, textAlign: 'center', marginTop: 16, fontWeight: '600' },
});
