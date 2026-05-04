import { useEffect, useState } from 'react'
import {
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogRoot,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface ExcluirDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Conteúdo descritivo exibido no corpo do dialog (pode incluir JSX com o nome do item) */
  descricao: React.ReactNode
  /** Função assíncrona que realiza a exclusão — deve lançar erro em caso de falha */
  onConfirm: () => Promise<void>
}

export function ExcluirDialog({ open, onOpenChange, descricao, onConfirm }: ExcluirDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    if (!open) {
      setError('')
      setIsLoading(false)
    }
  }, [open])

  async function handleConfirm() {
    setIsLoading(true)
    setError('')
    try {
      await onConfirm()
      onOpenChange(false)
    } catch {
      setError('Não foi possível excluir. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialogRoot open={open} onOpenChange={v => !isLoading && onOpenChange(v)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{descricao}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p className="mt-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Excluindo…' : 'Sim, excluir'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  )
}
