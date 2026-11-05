import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { colors, formatDate } from '../theme';

export default function TicketsScreen({ tickets, onSelect }) {
  if (tickets.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Aún no tienes entradas</Text>
        <Text style={styles.muted}>Compra una en Explorar y aparecerá aquí.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Entradas</Text>
      <FlatList
        data={tickets}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => onSelect(item)}>
            <View style={[styles.indicator, item.used && styles.indicatorUsed]} />
            <View style={styles.info}>
              <Text style={styles.eventName}>
                {item.event?.name ?? 'Evento'}
              </Text>
              <Text style={styles.venue}>
                {item.event?.venue ?? ''} · {formatDate(item.event?.date)}
              </Text>
              <Text style={styles.holder}>{item.holder}</Text>
            </View>
            <Text style={styles.arrow}>&gt;</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 6 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.green,
  },
  indicatorUsed: { backgroundColor: colors.muted },
  info: { flex: 1, gap: 2 },
  eventName: { fontSize: 16, fontWeight: '700', color: colors.text },
  venue: { fontSize: 13, color: colors.muted },
  holder: { fontSize: 13, color: colors.green, fontWeight: '600' },
  arrow: { fontSize: 18, color: colors.muted },
});
