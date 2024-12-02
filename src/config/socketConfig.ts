import { SocketOptions } from 'socket.io-client';

export const SOCKET_URL = import.meta.env.PROD 
  ? 'https://grapiz.onrender.com'
  : 'http://localhost:3001';

export const socketConfig: Partial<SocketOptions> = {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  timeout: 20000,
  transports: ['polling', 'websocket'],
  autoConnect: false,
  forceNew: true,
  withCredentials: true,
  path: '/socket.io/'
};