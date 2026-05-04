import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ExcluirDialog } from '@/components/shared/ExcluirDialog'
import { useToast } from '@/hooks/useToast'
import { LocadoresTable } from './LocadoresTable'
import { LocadorFormModal } from './LocadorFormModal'
import type { Locador } from './types'

export default function LocadoresPage() {
  const { toast } = useToast()

  const [locadores, setLocadores] = useState<Locador[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState('')

  const [formOpen, setFormOpen]   = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [toDelete, setToDelete]   = useState<Locador | null>(null)

  useEffect(() => {
    api
      .get<Locador[]>('/locadores')
      .then(({ data }) => setLocadores(data))
      .catch(() => {
        setError('Não foi possível carregar os locadores.')
        toast('Erro ao carregar locadores', { description: 'Não foi possível conectar ao servidor.', variant: 'error' })
      })
      .finally(() => setIsLoading(false))
  }, [])

  function handleOpenCreate() {
    setEditingId(null)
    setFormOpen(true)
  }

  function handleOpenEdit(locador: Locador) {
    setEditingId(locador.id)
    setFormOpen(true)
  }

  function handleFormSuccess(saved: Locador) {
    setLocadores(prev =>
      editingId
        ? prev.map(l => (l.id === saved.id ? saved : l))
        : [...prev, saved],
    )
    toast(
      editingId ? 'Locador atualizado' : 'Locador cadastrado',
      { description: `${saved.nome} ${saved.sobrenome} foi ${editingId ? 'atualizado' : 'cadastrado'} com sucesso.` },
    )
  }

  async function handleConfirmarExclusao() {
    try {
      await api.delete(`/locadores/${toDelete!.id}`)
      setLocadores(prev => prev.filter(l => l.id !== toDelete!.id))
      toast('Locador excluído', { description: `${toDelete!.nome} ${toDelete!.sobrenome} foi removido com sucesso.` })
    } catch {
      toast('Erro ao excluir locador', { description: 'Não foi possível concluir a exclusão. Tente novamente.', variant: 'error' })
    } finally {
      setToDelete(null)
    }
  }

  return (
    <div className="space-y-4">

      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Locadores</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os locadores cadastrados no sistema.
          </p>
        </div>
        <Button className="shrink-0" onClick={handleOpenCreate}>
          <Plus />
          Novo locador
        </Button>
      </div>

      {/* Tabela */}
      <LocadoresTable
        locadores={locadores}
        isLoading={isLoading}
        error={error}
        onEdit={handleOpenEdit}
        onDelete={setToDelete}
      />

      {/* Modal de criação / edição */}
      <LocadorFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        locadorId={editingId}
        onSuccess={handleFormSuccess}
      />

      {/* Dialog de confirmação de exclusão */}
      <ExcluirDialog
        open={!!toDelete}
        onOpenChange={v => !v && setToDelete(null)}
        descricao={
          <>
            Tem certeza que deseja excluir o locador{' '}
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
