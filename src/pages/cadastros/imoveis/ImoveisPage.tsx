import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ExcluirDialog } from '@/components/shared/ExcluirDialog'
import { useToast } from '@/hooks/useToast'
import { ImoveisTable } from './ImoveisTable'
import { ImovelFormModal } from './ImovelFormModal'
import type { Imovel } from './types'

export default function ImoveisPage() {
  const { toast } = useToast()

  const [imoveis, setImoveis]       = useState<Imovel[]>([])
  const [isLoading, setIsLoading]   = useState(true)
  const [error, setError]           = useState('')

  const [formOpen, setFormOpen]     = useState(false)
  const [editingId, setEditingId]   = useState<number | null>(null)

  const [toDelete, setToDelete]     = useState<Imovel | null>(null)

  useEffect(() => {
    api
      .get<Imovel[]>('/imovel')
      .then(({ data }) => setImoveis(data))
      .catch(() => {
        setError('Não foi possível carregar os imóveis.')
        toast('Erro ao carregar imóveis', { description: 'Não foi possível conectar ao servidor.', variant: 'error' })
      })
      .finally(() => setIsLoading(false))
  }, [])

  function handleOpenCreate() {
    setEditingId(null)
    setFormOpen(true)
  }

  function handleOpenEdit(imovel: Imovel) {
    setEditingId(imovel.id)
    setFormOpen(true)
  }

  function handleFormSuccess(saved: Imovel) {
    setImoveis(prev =>
      editingId
        ? prev.map(i => (i.id === saved.id ? saved : i))
        : [...prev, saved],
    )
    toast(
      editingId ? 'Imóvel atualizado' : 'Imóvel cadastrado',
      { description: 'Imóvel salvo com sucesso.' },
    )
  }

  async function handleConfirmarExclusao() {
    try {
      await api.delete(`/imovel/${toDelete!.id}`)
      setImoveis(prev => prev.filter(i => i.id !== toDelete!.id))
      toast('Imóvel excluído', { description: 'Imóvel excluído com sucesso.' })
    } catch {
      toast('Erro ao excluir imóvel', { description: 'Não foi possível concluir a exclusão. Tente novamente.', variant: 'error' })
    } finally {
      setToDelete(null)
    }
  }

  return (
    <div className="space-y-4">

      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Imóveis</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os imóveis disponíveis para locação.
          </p>
        </div>
        <Button className="shrink-0" onClick={handleOpenCreate}>
          <Plus />
          Novo imóvel
        </Button>
      </div>

      {/* Tabela */}
      <ImoveisTable
        imoveis={imoveis}
        isLoading={isLoading}
        error={error}
        onEdit={handleOpenEdit}
        onDelete={setToDelete}
      />

      {/* Modal de criação / edição */}
      <ImovelFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        imovelId={editingId}
        onSuccess={handleFormSuccess}
      />

      {/* Dialog de confirmação de exclusão */}
      <ExcluirDialog
        open={!!toDelete}
        onOpenChange={v => !v && setToDelete(null)}
        descricao={
          <>
            Tem certeza que deseja excluir o imóvel{' '}
            <strong className="text-foreground">
              {toDelete?.descricao}
            </strong>
            ? Esta ação não pode ser desfeita.
          </>
        }
        onConfirm={handleConfirmarExclusao}
      />
    </div>
  )
}
