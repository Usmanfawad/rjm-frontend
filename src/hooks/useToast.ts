import { useToastContext } from '@/context/ToastContext';

export function useToast() {
  const { addToast } = useToastContext();
  return { toast: addToast };
}
