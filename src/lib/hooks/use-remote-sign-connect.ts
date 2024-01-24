import { useEffect, useState } from 'react';
import { SocketPathUtil } from '../utils/socket-path.util';
import { useSocketStore } from '../stores/use-socket-store';

export const useRemoteSignConnect = (room: string) => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const { socket, setSocketPath } = useSocketStore();
  useEffect(() => {
    if (!socket) return;
    const socketPath = new SocketPathUtil(room);
    socket
      .timeout(10000)
      .emitWithAck('roomIn', socketPath.roomIn)
      .then((res) => {
        if (res.errorMessage) throw new Error(res.errorMessage);
        setSocketPath(socketPath);
      })
      .catch((error) => {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
        setSocketPath(undefined);
      });

    return () => {
      socket.emit('roomOut', socketPath.roomIn);
    };
  }, [room, socket, setSocketPath, setErrorMessage]);

  return { errorMessage };
};
