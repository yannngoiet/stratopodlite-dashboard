import { toast, type ExternalToast } from 'sonner'

export const notify = {
  success: (message: string, description?: string, options?: ExternalToast) =>
    toast.success(message, { description, ...options }),

  error: (message: string, description?: string, options?: ExternalToast) =>
    toast.error(message, { description, ...options }),

  warning: (message: string, description?: string, options?: ExternalToast) =>
    toast.warning(message, { description, ...options }),

  info: (message: string, description?: string, options?: ExternalToast) =>
    toast.info(message, { description, ...options }),

  loading: (message: string) =>
    toast.loading(message),

  dismiss: (id?: string | number) =>
    toast.dismiss(id),

  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => toast.promise(promise, messages),
}
