import { useState, useRef, useCallback } from "react";
import toast from "@/components/Toast";

type ToastMethod = "success" | "error" | "loading";

const callToast = (type: ToastMethod, message: string) => toast[type](message);

interface UseAsyncButtonOptions {
  timeout?: number;
  timeoutMessage?: string;
  timeoutType?: ToastMethod;
  onErrorMessage?: string;
  onErrorType?: ToastMethod;
}

export function useAsyncButton(
  asyncAction: () => Promise<unknown>,
  {
    timeout = 4000,
    timeoutMessage = "Tempo esgotado! Nenhuma resposta recebida.",
    timeoutType = "error",
    onErrorMessage = "Erro ao executar ação!",
    onErrorType = "error",
  }: UseAsyncButtonOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const finished = useRef(false);

  const handleClick = useCallback(async () => {

    
    setLoading(true);
    finished.current = false;
    const timer = setTimeout(() => {
      if (!finished.current) {
        callToast(timeoutType, timeoutMessage);
        setLoading(false);
      }
    }, timeout);
    try {
      await asyncAction();
      finished.current = true;
      clearTimeout(timer);
    } catch {
      finished.current = true;
      clearTimeout(timer);
      callToast(onErrorType, onErrorMessage);
    } finally {
      setLoading(false);
    }
  }, [asyncAction, timeout, timeoutMessage, timeoutType, onErrorMessage, onErrorType]);

  return { loading, handleClick };
}
