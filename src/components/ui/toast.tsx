import * as React from 'react'
import { Toast } from 'radix-ui'
import { CheckCircle2, X, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastVariant = 'success' | 'error'

const ToastProvider = Toast.Provider

function ToastViewport({ className, ...props }: React.ComponentProps<typeof Toast.Viewport>) {
  return (
    <Toast.Viewport
      className={cn(
        'fixed top-4 right-4 z-[100] flex w-[380px] max-w-[calc(100vw-2rem)] flex-col gap-2',
        className,
      )}
      {...props}
    />
  )
}

interface ToastRootProps extends React.ComponentProps<typeof Toast.Root> {
  variant?: ToastVariant
}

function ToastRoot({ className, variant = 'success', ...props }: ToastRootProps) {
  return (
    <Toast.Root
      className={cn(
        'pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-4 shadow-lg',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-right-full',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-full',
        'duration-300',
        variant === 'success'
          ? 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100'
          : 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100',
        className,
      )}
      {...props}
    />
  )
}

function ToastIcon({ variant }: { variant: ToastVariant }) {
  return variant === 'success'
    ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-400" />
    : <XCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
}

function ToastTitle({ className, ...props }: React.ComponentProps<typeof Toast.Title>) {
  return (
    <Toast.Title
      className={cn('text-sm font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
}

function ToastDescription({ className, ...props }: React.ComponentProps<typeof Toast.Description>) {
  return (
    <Toast.Description
      className={cn('text-sm opacity-75', className)}
      {...props}
    />
  )
}

function ToastClose({ className, ...props }: React.ComponentProps<typeof Toast.Close>) {
  return (
    <Toast.Close
      className={cn(
        'shrink-0 rounded-md p-0.5 opacity-50 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring',
        className,
      )}
      {...props}
    >
      <X className="size-4" />
      <span className="sr-only">Fechar</span>
    </Toast.Close>
  )
}

export {
  ToastProvider,
  ToastViewport,
  ToastRoot,
  ToastIcon,
  ToastTitle,
  ToastDescription,
  ToastClose,
}
