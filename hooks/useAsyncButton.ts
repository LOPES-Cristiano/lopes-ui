import { useState, useRef, useCallback, useEffect } from "react";
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
  const inFlightRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);

    let timedOut = false;
    let loadingToastId: string | undefined;

    timerRef.current = setTimeout(() => {
      if (inFlightRef.current) {
        timedOut = true;
        inFlightRef.current = false;
        loadingToastId = callToast(timeoutType, timeoutMessage);
        if (mountedRef.current) setLoading(false);
      }
    }, timeout);

    try {
      await asyncAction();
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (loadingToastId && timeoutType === "loading") {
        toast.dismiss(loadingToastId);
      }
    } catch {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (loadingToastId && timeoutType === "loading") {
        toast.dismiss(loadingToastId);
      }
      if (!timedOut) {
        callToast(onErrorType, onErrorMessage);
      }
    } finally {
      inFlightRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [asyncAction, timeout, timeoutMessage, timeoutType, onErrorMessage, onErrorType]);

  return { loading, handleClick };
}
