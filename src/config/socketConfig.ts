import { SocketOptions } from 'socket.io-client';

export const SOCKET_URL = import.meta.env.PROD 
  ? 'https://grapiz.onrender.com'
  : 'http://localhost:3001';

export const socketConfig: Partial<SocketOptions> = {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  autoConnect: false,
  forceNew: true,
  path: '/socket.io/',
  withCredentials: false,
  rejectUnauthorized: false,
  secure: true,
  closeOnBeforeunload: false
};