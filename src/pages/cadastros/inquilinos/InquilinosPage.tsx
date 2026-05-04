import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ExcluirDialog } from '@/components/shared/ExcluirDialog'
import { useToast } from '@/hooks/useToast'
import { InquilinosTable } from './InquilinosTable'
import { InquilinoFormModal } from './InquilinoFormModal'
import type { Inquilino, SpringPage } from './types'

const PAGE_SIZE = 10

export default function InquilinosPage() {
  const { toast } = useToast()

  // lista
  const [inquilinos, setInquilinos]       = useState<Inquilino[]>([])
  const [isLoading, setIsLoading]         = useState(true)
  const [error, setError]                 = useState('')

  // paginação
  const [page, setPage]                   = useState(0)
  const [totalPages, setTotalPages]       = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // filtros — draft (digitado) / committed (enviado à API)
  const [draftCpf, setDraftCpf]                 = useState('')
  const [nome, setNome]                         = useState('')
  const [cpf, setCpf]                           = useState('')
  const [filterStatus, setFilterStatus]         = useState<'all' | 'true' | 'false'>('all')

  // força refetch após mutação (save / delete)
  const [refreshKey, setRefreshKey] = useState(0)

  // modal
  const [formOpen, setFormOpen]   = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // exclusão
  const [toDelete, setToDelete]   = useState<Inquilino | null>(null)

  // debounce dos campos de texto — comita após 400ms sem digitar
  useEffect(() => {
    const id = setTimeout(() => {
      setCpf(draftCpf)
      setPage(0)
    }, 400)
    return () => clearTimeout(id)
  }, [draftCpf])

  // fetch principal
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError('')

    const params: Record<string, string> = {
      page: String(page),
      size: String(PAGE_SIZE),
    }
    if (nome)         params.nome   = nome
    if (cpf)          params.cpf    = cpf
    if (filterStatus !== 'all') params.status = filterStatus

    api
      .get<SpringPage<Inquilino>>('/inquilinos', { params })
      .then(({ data }) => {
        if (cancelled) return
        setInquilinos(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      })
      .catch(() => {
        if (cancelled) return
        setError('Não foi possível carregar os inquilinos.')
        toast('Erro ao carregar inquilinos', { description: 'Não foi possível conectar ao servidor.', variant: 'error' })
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [nome, cpf, filterStatus, page, refreshKey])

  function handleStatusChange(v: string) {
    setFilterStatus(v as 'all' | 'true' | 'false')
    setPage(0)
  }

  function handleOpenCreate() {
    setEditingId(null)
    setFormOpen(true)
  }

  function handleOpenEdit(inquilino: Inquilino) {
    setEditingId(inquilino.id)
    setFormOpen(true)
  }

  function handleFormSuccess(_saved: Inquilino) {
    setRefreshKey(k => k + 1)
    toast(
      editingId ? 'Inquilino atualizado' : 'Inquilino cadastrado',
      { description: 'Operação realizada com sucesso.' },
    )
  }

  async function handleConfirmarExclusao() {
    try {
      await api.delete(`/inquilinos/${toDelete!.id}`)
      setRefreshKey(k => k + 1)
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

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Buscar por CPF..."
          value={draftCpf}
          onChange={e => setDraftCpf(e.target.value)}
          className="sm:max-w-xs"
        />
        <SelectRoot value={filterStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Ativo</SelectItem>
            <SelectItem value="false">Inativo</SelectItem>
          </SelectContent>
        </SelectRoot>
      </div>

      {/* Tabela */}
      <InquilinosTable
        inquilinos={inquilinos}
        isLoading={isLoading}
        error={error}
        pagination={{ page, totalPages, totalElements, pageSize: PAGE_SIZE }}
        onPageChange={setPage}
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
