import toast from '@/components/Toast';

export function useToast() {
  return {
    showToast: (msg: string) => toast.success(msg),
    showWarning: (msg: string) => toast.warning(msg),
    showError: (msg: string) => toast.error(msg),
  };
}

