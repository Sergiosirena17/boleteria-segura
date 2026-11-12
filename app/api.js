export const API_URL = 'http://localhost:3000';
export const DEVICE_ID = 'device-' + Math.random().toString(36).slice(2, 10);

let authToken = null;

export function setToken(t) { authToken = t; }
export function getToken() { return authToken; }

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers.authorization = `Bearer ${authToken}`;
  const res = await fetch(API_URL + path, { headers, ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Error de conexión');
  return data;
}

export const register = (name, email, password) =>
  request('/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });

export const login = (email, password) =>
  request('/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const getEvents = () => request('/events');

export const buyTicket = (eventId) =>
  request('/tickets', {
    method: 'POST',
    body: JSON.stringify({ eventId, deviceId: DEVICE_ID }),
  });

export const confirmPayment = (paymentId, method) =>
  request(`/payments/${paymentId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ method }),
  });

export const getQr = (ticketId) =>
  request(`/tickets/${ticketId}/qr?deviceId=${DEVICE_ID}`);

export const getMyTickets = () =>
  request(`/tickets?deviceId=${DEVICE_ID}`);
