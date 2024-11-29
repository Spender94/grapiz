import { useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';

export function useSocketConnection(socket: Socket | undefined) {
  const connect = useCallback(() => {
    if (!socket) return;
    
    if (!socket.connected) {
      console.log('Attempting to connect...');
      socket.connect();
    }
  }, [socket]);

  const handleConnectionError = useCallback((error: Error) => {
    console.error('Connection error:', error.message);
    setTimeout(connect, 2000); // Retry after 2 seconds
  }, [connect]);

  const handleDisconnect = useCallback((reason: string) => {
    console.log('Disconnected:', reason);
    if (reason === 'io server disconnect' || reason === 'transport close') {
      setTimeout(connect, 1000);
    }
  }, [connect]);

  useEffect(() => {
    if (!socket) return;

    socket.on('connect_error', handleConnectionError);
    socket.on('disconnect', handleDisconnect);

    connect();

    return () => {
      socket.off('connect_error', handleConnectionError);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket, connect, handleConnectionError, handleDisconnect]);

  return { connect };
}