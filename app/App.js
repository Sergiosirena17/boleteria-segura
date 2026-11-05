import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import ExploreScreen from './screens/ExploreScreen';
import TicketsScreen from './screens/TicketsScreen';
import TicketScreen from './screens/TicketScreen';
import { colors } from './theme';
import { getMyTickets } from './api';

export default function App() {
  const [tab, setTab] = useState('explore');
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getMyTickets().then(setTickets).catch(() => {});
  }, []);

  function handleBought(newTicket) {
    setTickets((prev) => [newTicket, ...prev]);
    setSelected(newTicket);
    setTab('tickets');
  }

  function handleSelect(ticket) {
    setSelected(ticket);
    setTab('detail');
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        {tab === 'explore' && <ExploreScreen onBought={handleBought} />}
        {tab === 'tickets' && (
          <TicketsScreen tickets={tickets} onSelect={handleSelect} />
        )}
        {tab === 'detail' && (
          <TicketScreen ticket={selected} onBack={() => setTab('tickets')} />
        )}
      </View>
      <View style={styles.tabBar}>
        <Tab label="Explorar" active={tab === 'explore'} onPress={() => setTab('explore')} />
        <Tab
          label="Mis Entradas"
          active={tab === 'tickets' || tab === 'detail'}
          onPress={() => setTab('tickets')}
          badge={tickets.length}
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

function Tab({ label, active, onPress, badge }) {
  return (
    <Pressable style={styles.tab} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabActive]}>{label}</Text>
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 40 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E1E6E3',
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  tabText: { color: colors.muted, fontWeight: '600' },
  tabActive: { color: colors.green },
  badge: { backgroundColor: colors.green, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
