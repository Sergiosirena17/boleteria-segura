import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import ExploreScreen from './screens/ExploreScreen';
import PaymentScreen from './screens/PaymentScreen';
import TicketsScreen from './screens/TicketsScreen';
import TicketScreen from './screens/TicketScreen';
import { colors } from './theme';
import { getMyTickets, setToken } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('explore');
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [pendingPayment, setPendingPayment] = useState(null);

  useEffect(() => {
    if (user) getMyTickets().then(setTickets).catch(() => {});
  }, [user]);

  function handleLogin(u) {
    setUser(u);
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    setTickets([]);
    setTab('explore');
  }

  function handleBought(ticket) {
    setPendingPayment(ticket);
    setTab('payment');
  }

  function handlePaid(ticket) {
    setPendingPayment(null);
    setTickets((prev) => [ticket, ...prev]);
    setSelected(ticket);
    setTab('detail');
  }

  function handleSelect(ticket) {
    setSelected(ticket);
    setTab('detail');
  }

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <View style={s.container}>
      <View style={s.topBar}>
        <Text style={s.greeting}>Hola, {user.name}</Text>
        <Pressable onPress={handleLogout}>
          <Text style={s.logout}>Salir</Text>
        </Pressable>
      </View>
      <View style={{ flex: 1 }}>
        {tab === 'explore' && <ExploreScreen onBought={handleBought} />}
        {tab === 'payment' && pendingPayment && (
          <PaymentScreen
            ticket={pendingPayment}
            onPaid={handlePaid}
            onCancel={() => { setPendingPayment(null); setTab('explore'); }}
          />
        )}
        {tab === 'tickets' && (
          <TicketsScreen tickets={tickets} onSelect={handleSelect} />
        )}
        {tab === 'detail' && (
          <TicketScreen ticket={selected} onBack={() => setTab('tickets')} />
        )}
      </View>
      <View style={s.tabBar}>
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
    <Pressable style={s.tab} onPress={onPress}>
      <Text style={[s.tabText, active && s.tabActive]}>{label}</Text>
      {badge > 0 && (
        <View style={s.badge}>
          <Text style={s.badgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 40 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  greeting: { fontSize: 14, color: colors.muted },
  logout: { fontSize: 14, color: colors.green, fontWeight: '600' },
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
