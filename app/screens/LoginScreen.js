import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { login, register, setToken } from '../api';
import { colors } from '../theme';

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      let res;
      if (mode === 'login') {
        res = await login(email, password);
      } else {
        res = await register(name, email, password);
      }
      setToken(res.token);
      onLogin(res.user);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <View style={s.container}>
      <Text style={s.logo}>Boletería Segura</Text>
      <Text style={s.subtitle}>
        {mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
      </Text>

      {mode === 'register' && (
        <TextInput style={s.input} placeholder="Nombre" value={name} onChangeText={setName} />
      )}
      <TextInput
        style={s.input}
        placeholder="Correo"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={s.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error && <Text style={s.error}>{error}</Text>}

      <Pressable style={s.btn} onPress={submit} disabled={loading}>
        <Text style={s.btnText}>
          {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Registrarme'}
        </Text>
      </Pressable>

      <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
        <Text style={s.link}>
          {mode === 'login' ? 'No tengo cuenta' : 'Ya tengo cuenta'}
        </Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 32, backgroundColor: colors.bg },
  logo: { fontSize: 28, fontWeight: '700', color: colors.green, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.muted, textAlign: 'center', marginBottom: 32 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E6E3',
  },
  error: { color: '#B3261E', marginBottom: 12, textAlign: 'center' },
  btn: { backgroundColor: colors.green, padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { color: colors.green, textAlign: 'center', marginTop: 20, fontWeight: '600' },
});
