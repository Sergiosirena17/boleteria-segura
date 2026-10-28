import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import ExploreScreen from './screens/ExploreScreen';
import TicketScreen from './screens/TicketScreen';
import { colors } from './theme';

export default function App() {
  const [tab, setTab] = useState('explore');
  const [ticket, setTicket] = useState(null);

  function handleBought(newTicket) {
    setTicket(newTicket);
    setTab('ticket');
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        {tab === 'explore' ? (
          <ExploreScreen onBought={handleBought} />
        ) : (
          <TicketScreen ticket={ticket} />
        )}
      </View>
      <View style={styles.tabBar}>
        <Tab label="Explorar" active={tab === 'explore'} onPress={() => setTab('explore')} />
        <Tab label="Mi Entrada" active={tab === 'ticket'} onPress={() => setTab('ticket')} />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

function Tab({ label, active, onPress }) {
  return (
    <Pressable style={styles.tab} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabActive]}>{label}</Text>
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
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabText: { color: colors.muted, fontWeight: '600' },
  tabActive: { color: colors.green },
});
