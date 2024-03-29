import { useEffect, useRef, useState } from 'react';
import { SocketPathUtil } from '../utils/socket-path.util';
import {
  ISock,
  SockModel as SockData,
  SockModel,
  ToWeb,
} from '@/app/classes/sock-model';
import { useSocketStore } from '../stores/use-socket-store';
import { SignConfirmProps } from '../props/sign-confirm.prop';
import { ImageUtil } from '../utils/image.util';
import { useRouter } from 'next/navigation';

interface UseSocketReceiveArgs { }

const useSocketReceive = () => {
  const {
    socket,
    imageData,
    setShowSign,
    setImageData,
    clearImageDataWithSign,
  } = useSocketStore();
  const signRef = useRef<SignConfirmProps>(null);
  const imageSrc = ImageUtil.bufferToSrc(imageData);
  const { push } = useRouter();

  useEffect(() => {
    const handleOrders = async (data: ISock, callback: any) => {
      await callback?.(true);
      const { toWeb, imageBuffer } = new SockData(data);
      switch (toWeb) {
        case ToWeb.서명요청:
          return setShowSign(true);
        case ToWeb.서명취소:
          return setShowSign(false);
        case ToWeb.서명확인:
          return signRef?.current?.onConfirm();
        case ToWeb.화면공유:
          return setImageData(imageBuffer);
        case ToWeb.화면초기화:
        case ToWeb.작성완료:
          clearImageDataWithSign();
      }
    };

    const handleLeaveRoom = (room: string) => {
      push('/remote');
    };

    socket?.on(SocketPathUtil.ev, handleOrders);
    socket?.on(SocketPathUtil.leaveRoomEv, handleLeaveRoom);
    return () => {
      socket?.off(SocketPathUtil.ev, handleOrders);
      socket?.off(SocketPathUtil.leaveRoomEv, handleLeaveRoom);
    };
  }, [push, clearImageDataWithSign, setImageData, setShowSign, socket]);

  return { socket, signRef, imageSrc };
};

export default useSocketReceive;
