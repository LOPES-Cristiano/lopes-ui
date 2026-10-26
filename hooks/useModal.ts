import { useState, useCallback } from 'react';

export type ModalState<T> = {
  isOpen: boolean;
  data: T | null;
  open: (data: T | null) => void;
  close: () => void;
};

export function useModal<T = void>(): ModalState<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((payload: T | null) => {
    setData(payload);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  return { isOpen, data, open, close };
}
