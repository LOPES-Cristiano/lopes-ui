import { useCallback, useEffect, useState } from "react";

let sharedAudioContext: AudioContext | null = null;
let audioUnlocked = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioContext) {
    try {
      sharedAudioContext = new AudioCtx();
    } catch {
      sharedAudioContext = null;
    }
  }
  return sharedAudioContext;
}

/**
 * Sintetiza um aviso sonoro suave de dois tons (`D5 -> A5`) via Web Audio API sem arquivos externos,
 * respeitando estado de mudo e vibrando discretamente em dispositivos compatíveis.
 */
export function playNotificationChime(options?: { vibrate?: boolean }): void {
  if (typeof window === "undefined") return;

  if (options?.vibrate !== false && typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(35);
    } catch {
      // ignore unsupported/blocked vibration
    }
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    const now = ctx.currentTime;
    const playTone = (freq: number, startOffset: number, duration: number, peakGain: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + startOffset);
      gain.gain.setValueAtTime(0.0001, now + startOffset);
      gain.gain.exponentialRampToValueAtTime(peakGain, now + startOffset + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + startOffset);
      osc.stop(now + startOffset + duration + 0.02);
    };

    playTone(587.33, 0, 0.14, 0.08); // D5
    playTone(880.0, 0.11, 0.22, 0.07); // A5
  } catch {
    // ignore autoplay policy block before user gesture
  }
}

export interface UseSoundNotificationOptions {
  /** Chave em `localStorage` para persistir preferência de mudo. Padrão: `"lopes-ui-sound-muted"`. */
  storageKey?: string;
  /** Estado inicial caso não haja preferência salva. Padrão: `false`. */
  defaultMuted?: boolean;
}

export function useSoundNotification(options: UseSoundNotificationOptions = {}) {
  const { storageKey = "lopes-ui-sound-muted", defaultMuted = false } = options;

  const [muted, setMutedState] = useState<boolean>(() => {
    if (typeof window === "undefined") return defaultMuted;
    try {
      const stored = window.localStorage.getItem(storageKey);
      return stored === null ? defaultMuted : stored === "true";
    } catch {
      return defaultMuted;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined" || audioUnlocked) return;
    const unlock = () => {
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") {
        void ctx.resume();
      }
      audioUnlocked = true;
    };
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const setMuted = useCallback(
    (next: boolean) => {
      setMutedState(next);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(storageKey, String(next));
        } catch {
          // ignore
        }
      }
    },
    [storageKey],
  );

  const toggleMuted = useCallback(() => {
    setMuted(!muted);
  }, [muted, setMuted]);

  const notify = useCallback(() => {
    if (muted) return;
    playNotificationChime();
  }, [muted]);

  return { muted, setMuted, toggleMuted, notify };
}
