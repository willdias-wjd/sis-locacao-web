import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ExcluirDialog } from '@/components/shared/ExcluirDialog'
import { useToast } from '@/hooks/useToast'
import { InquilinosTable } from './InquilinosTable'
import { InquilinoFormModal } from './InquilinoFormModal'
import type { Inquilino } from './types'

export default function InquilinosPage() {
  const { toast } = useToast()

  const [inquilinos, setInquilinos] = useState<Inquilino[]>([])
  const [isLoading, setIsLoading]   = useState(true)
  const [error, setError]           = useState('')

  // Modal de criação/edição
  const [formOpen, setFormOpen]       = useState(false)
  const [editingId, setEditingId]     = useState<number | null>(null)

  // Dialog de exclusão
  const [toDelete, setToDelete]       = useState<Inquilino | null>(null)

  useEffect(() => {
    api
      .get<Inquilino[]>('/inquilinos')
      .then(({ data }) => setInquilinos(data))
      .catch(() => {
        setError('Não foi possível carregar os inquilinos.')
        toast('Erro ao carregar inquilinos', { description: 'Não foi possível conectar ao servidor.', variant: 'error' })
      })
      .finally(() => setIsLoading(false))
  }, [])

  function handleOpenCreate() {
    setEditingId(null)
    setFormOpen(true)
  }

  function handleOpenEdit(inquilino: Inquilino) {
    setEditingId(inquilino.id)
    setFormOpen(true)
  }

  function handleFormSuccess(saved: Inquilino) {
    setInquilinos(prev =>
      editingId
        ? prev.map(i => (i.id === saved.id ? saved : i))
        : [...prev, saved],
    )
    toast(
      editingId ? 'Inquilino atualizado' : 'Inquilino cadastrado',
      { description: `${saved.nome} ${saved.sobrenome} foi ${editingId ? 'atualizado' : 'cadastrado'} com sucesso.` },
    )
  }

  async function handleConfirmarExclusao() {
    try {
      await api.delete(`/inquilinos/${toDelete!.id}`)
      setInquilinos(prev => prev.filter(i => i.id !== toDelete!.id))
      toast('Inquilino excluído', { description: `${toDelete!.nome} ${toDelete!.sobrenome} foi removido com sucesso.` })
    } catch {
      toast('Erro ao excluir inquilino', { description: 'Não foi possível concluir a exclusão. Tente novamente.', variant: 'error' })
    } finally {
      setToDelete(null)
    }
  }

  return (
    <div className="space-y-4">

      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inquilinos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os inquilinos cadastrados no sistema.
          </p>
        </div>
        <Button className="shrink-0" onClick={handleOpenCreate}>
          <Plus />
          Novo inquilino
        </Button>
      </div>

      {/* Tabela */}
      <InquilinosTable
        inquilinos={inquilinos}
        isLoading={isLoading}
        error={error}
        onEdit={handleOpenEdit}
        onDelete={setToDelete}
      />

      {/* Modal de criação / edição */}
      <InquilinoFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        inquilinoId={editingId}
        onSuccess={handleFormSuccess}
      />

      {/* Dialog de confirmação de exclusão */}
      <ExcluirDialog
        open={!!toDelete}
        onOpenChange={v => !v && setToDelete(null)}
        descricao={
          <>
            Tem certeza que deseja excluir o inquilino{' '}
            <strong className="text-foreground">
              {toDelete?.nome} {toDelete?.sobrenome}
            </strong>
            ? Esta ação não pode ser desfeita.
          </>
        }
        onConfirm={handleConfirmarExclusao}
      />
    </div>
  )
}
