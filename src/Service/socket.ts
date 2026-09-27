import {io} from 'socket.io-client';
import {APP_URL} from './axios';

export const SOCKET_EVENTS = {
  CONNECTED: 'connected',
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_DELETED: 'notification:deleted',
  SUPPORT_TICKET_NEW: 'support:ticket:new',
  SUPPORT_TICKET_UPDATED: 'support:ticket:updated',
  SUPPORT_MESSAGE_NEW: 'support:message:new',
  SUPPORT_JOIN: 'support:join',
  SUPPORT_LEAVE: 'support:leave',
};

let socket = null;

function normalizeToken(token) {
  if (!token) {
    return '';
  }
  const value = String(token).trim();
  return value.startsWith('Bearer ') ? value : `Bearer ${value}`;
}

/** Socket.IO connects to the API host root (not /api). */
export function getSocketUrl() {
  return String(APP_URL || '').replace(/\/?$/, '/');
}

export function getAppSocket() {
  return socket;
}

export function connectAppSocket(token) {
  const authToken = normalizeToken(token);
  if (!authToken) {
    return null;
  }

  if (socket) {
    socket.auth = {token: authToken};
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  socket = io(getSocketUrl(), {
    autoConnect: false,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 12,
    reconnectionDelay: 1000,
    auth: {token: authToken},
  });

  socket.connect();
  return socket;
}

export function disconnectAppSocket() {
  if (!socket) {
    return;
  }
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}
