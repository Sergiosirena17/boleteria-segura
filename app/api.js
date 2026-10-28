// En el celular, reemplaza localhost por la IP de tu computadora
export const API_URL = 'http://localhost:3000';

// Temporal: luego se usará el ID real del dispositivo con expo-application
export const DEVICE_ID = 'device-' + Math.random().toString(36).slice(2, 10);

async function request(path, options) {
  const res = await fetch(API_URL + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Error de conexión');
  return data;
}

export const getEvents = () => request('/events');

export const buyTicket = (eventId, holder) =>
  request('/tickets', {
    method: 'POST',
    body: JSON.stringify({ eventId, holder, deviceId: DEVICE_ID }),
  });

export const getQr = (ticketId) =>
  request(`/tickets/${ticketId}/qr?deviceId=${DEVICE_ID}`);
