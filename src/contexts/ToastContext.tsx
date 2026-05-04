import * as React from 'react'
import {
  ToastProvider as RadixToastProvider,
  ToastViewport,
  ToastRoot,
  ToastIcon,
  ToastTitle,
  ToastDescription,
  ToastClose,
  type ToastVariant,
} from '@/components/ui/toast'

export interface ToastOptions {
  description?: string
  variant?: ToastVariant
}

export interface ToastContextValue {
  toast: (title: string, options?: ToastOptions) => void
}

export const ToastContext = React.createContext<ToastContextValue | null>(null)

interface ToastItem {
  id: number
  title: string
  description?: string
  variant: ToastVariant
  open: boolean
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const toast = React.useCallback((title: string, options?: ToastOptions) => {
    setToasts(prev => [
      ...prev,
      { id: Date.now(), title, description: options?.description, variant: options?.variant ?? 'success', open: true },
    ])
  }, [])

  function dismiss(id: number) {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, open: false } : t)))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350)
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToastProvider swipeDirection="right" duration={4500}>
        {children}

        {toasts.map(t => (
          <ToastRoot key={t.id} open={t.open} onOpenChange={open => !open && dismiss(t.id)} variant={t.variant}>
            <ToastIcon variant={t.variant} />
            <div className="flex-1 space-y-1">
              <ToastTitle>{t.title}</ToastTitle>
              {t.description && <ToastDescription>{t.description}</ToastDescription>}
            </div>
            <ToastClose onClick={() => dismiss(t.id)} />
          </ToastRoot>
        ))}

        <ToastViewport />
      </RadixToastProvider>
    </ToastContext.Provider>
  )
}
