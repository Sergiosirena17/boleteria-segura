import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { getEvents, buyTicket } from '../api';
import { colors, formatDate } from '../theme';

export default function ExploreScreen({ onBought }) {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    getEvents().then(setEvents).catch((e) => setError(e.message));
  }, []);

  async function buy(event) {
    try {
      const ticket = await buyTicket(event.id, 'Sergio S.');
      onBought({ ...ticket, event });
    } catch (e) {
      setError(e.message);
    }
  }

  const filtered = events.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explorar</Text>
      <TextInput
        style={styles.search}
        placeholder="Buscar en Arequipa..."
        value={search}
        onChangeText={setSearch}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        renderItem={({ item }) => {
          const soldOut = item.stock <= 0;
          return (
            <View style={styles.card}>
              <View style={[styles.cardHeader, soldOut && { backgroundColor: '#8A6A4A' }]}>
                <Text style={styles.cardDate}>
                  {soldOut ? 'AGOTADO' : formatDate(item.date)}
                </Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.eventName}>{item.name}</Text>
                <Text style={styles.venue}>
                  {item.venue} · {item.city}
                </Text>
                <View style={styles.row}>
                  <Text style={styles.price}>S/ {item.price.toFixed(2)}</Text>
                  {soldOut ? (
                    <View style={[styles.button, { backgroundColor: colors.amber }]}>
                      <Text style={styles.buttonText}>Reventa pronto</Text>
                    </View>
                  ) : (
                    <Pressable style={styles.button} onPress={() => buy(item)}>
                      <Text style={styles.buttonText}>Comprar</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 12 },
  search: {
    backgroundColor: '#E6E9E8',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  error: { color: '#B3261E', marginBottom: 12 },
  card: { backgroundColor: colors.card, borderRadius: 14, overflow: 'hidden' },
  cardHeader: { backgroundColor: colors.green, padding: 12 },
  cardDate: { color: '#fff', fontWeight: '700', textTransform: 'capitalize' },
  cardBody: { padding: 14, gap: 4 },
  eventName: { fontSize: 16, fontWeight: '700', color: colors.text },
  venue: { color: colors.muted },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  price: { fontSize: 18, fontWeight: '700', color: colors.green },
  button: { backgroundColor: colors.green, paddingVertical: 9, paddingHorizontal: 16, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
