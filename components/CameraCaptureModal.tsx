'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, RefreshCw, X } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import Button from './Button';
import toast from './Toast';

export type CameraCaptureModalProps = {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  title?: string;
  description?: string;
  idealWidth?: number;
  idealHeight?: number;
  facingMode?: 'user' | 'environment';
  componentId?: string;
};

export function CameraCaptureModal({
  open,
  onClose,
  onCapture,
  title = 'Capturar Foto com a Câmera',
  description = 'Posicione o rosto no quadro central e capture a imagem',
  idealWidth = 1280,
  idealHeight = 720,
  facingMode = 'user',
  componentId = 'erp.camera-capture-modal',
}: CameraCaptureModalProps) {
  const titleId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const openRef = useRef(open);
  openRef.current = open;
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [iniciando, setIniciando] = useState(false);
  const [erroCamera, setErroCamera] = useState<string | null>(null);

  useBodyScrollLock(open);

  const stopActiveStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
  }, []);

  // Inicializa o stream quando o modal abre
  useEffect(() => {
    if (!open) {
      stopActiveStream();
      setErroCamera(null);
      return;
    }

    let ativo = true;

    async function iniciarCamera() {
      stopActiveStream();
      setIniciando(true);
      setErroCamera(null);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: idealWidth },
            height: { ideal: idealHeight },
          },
          audio: false,
        });

        if (!ativo) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          void videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        if (!ativo) return;
        const msg =
          err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
            ? 'Acesso à câmera não autorizado. Habilite a permissão no navegador.'
            : 'Não foi possível inicializar a câmera. Verifique se outro app a está utilizando.';
        setErroCamera(msg);
        toast.error(msg);
      } finally {
        if (ativo) setIniciando(false);
      }
    }

    void iniciarCamera();

    return () => {
      ativo = false;
      stopActiveStream();
    };
  }, [open, facingMode, idealWidth, idealHeight, stopActiveStream]);

  // Vincula o stream ao elemento de vídeo quando disponível
  useEffect(() => {
    if (open && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      void videoRef.current.play().catch(() => {});
    }
  }, [open, stream]);

  // Tecla ESC para fechar
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleCapturar = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error('Erro ao processar imagem capturada.');
          return;
        }
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        onClose();
        toast.success('Foto capturada com sucesso!');
      },
      'image/jpeg',
      0.92
    );
  };

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Canvas invisível para gravação de foto */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Camera size={18} />
            </div>
            <div>
              <h3 id={titleId} className="font-bold text-sm sm:text-base text-foreground tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
            title="Fechar Câmera"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewport da Câmera */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-zinc-950 overflow-hidden flex items-center justify-center">
          {erroCamera ? (
            <div className="p-6 text-center max-w-sm flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                <Camera size={22} />
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{erroCamera}</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  stopActiveStream();
                  setErroCamera(null);
                  setIniciando(true);
                  void navigator.mediaDevices
                    ?.getUserMedia({
                      video: { facingMode, width: { ideal: idealWidth }, height: { ideal: idealHeight } },
                      audio: false,
                    })
                    .then((s) => {
                      if (!openRef.current) {
                        s.getTracks().forEach((t) => t.stop());
                        return;
                      }
                      streamRef.current = s;
                      setStream(s);
                      setIniciando(false);
                    })
                    .catch((err: any) => {
                      const msg =
                        err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
                          ? 'Acesso à câmera não autorizado. Habilite a permissão no navegador.'
                          : 'Não foi possível inicializar a câmera. Verifique se outro app a está utilizando.';
                      setErroCamera(msg);
                      setIniciando(false);
                    });
                }}
                leftIcon={<RefreshCw size={13} className={iniciando ? 'animate-spin' : ''} />}
              >
                Tentar novamente
              </Button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />

              {/* Retículo e Guia de Enquadramento */}
              <div className="absolute inset-8 sm:inset-10 border-2 border-dashed border-white/40 rounded-3xl pointer-events-none" />

              {/* Marcadores de cantos */}
              <div className="absolute top-6 left-6 sm:top-8 sm:left-8 w-6 h-6 border-t-2 border-l-2 border-primary pointer-events-none rounded-tl-lg" />
              <div className="absolute top-6 right-6 sm:top-8 sm:right-8 w-6 h-6 border-t-2 border-r-2 border-primary pointer-events-none rounded-tr-lg" />
              <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 w-6 h-6 border-b-2 border-l-2 border-primary pointer-events-none rounded-bl-lg" />
              <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 w-6 h-6 border-b-2 border-r-2 border-primary pointer-events-none rounded-br-lg" />

              {/* Badge de status */}
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 max-w-[calc(100%-1.5rem)] px-3 sm:px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white text-[11px] sm:text-xs font-medium flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Câmera conectada • Encaixe o rosto no quadro</span>
              </div>
            </>
          )}
        </div>

        {/* Rodapé com Botões Padrão do Sistema */}
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-muted/40 border-t border-border">
          <Button
            componentId={`${componentId}.cancelar`}
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            leftIcon={<X size={15} />}
          >
            Cancelar
          </Button>
          <Button
            componentId={`${componentId}.capturar`}
            type="button"
            variant="primary"
            size="md"
            disabled={Boolean(erroCamera) || iniciando}
            className="font-semibold px-6 shadow-sm"
            leftIcon={<Camera size={16} />}
            onClick={handleCapturar}
          >
            Capturar Foto
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default CameraCaptureModal;
