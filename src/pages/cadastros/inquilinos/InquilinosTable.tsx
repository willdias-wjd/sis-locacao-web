import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Inquilino } from './types'

const SKELETON_ROWS = 5

interface PaginationInfo {
  page: number
  totalPages: number
  totalElements: number
  pageSize: number
}

interface InquilinosTableProps {
  inquilinos: Inquilino[]
  isLoading: boolean
  error: string
  pagination: PaginationInfo
  onEdit:       (inquilino: Inquilino) => void
  onDelete:     (inquilino: Inquilino) => void
  onPageChange: (page: number) => void
}

export function InquilinosTable({
  inquilinos,
  isLoading,
  error,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
}: InquilinosTableProps) {
  const { page, totalPages, totalElements, pageSize } = pagination

  const start = totalElements === 0 ? 0 : page * pageSize + 1
  const end   = Math.min((page + 1) * pageSize, totalElements)

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead className="w-28">Status</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Sobrenome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead className="w-24 text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><div className="h-4 w-8 animate-pulse rounded bg-muted" /></TableCell>
                <TableCell><div className="h-5 w-16 animate-pulse rounded-full bg-muted" /></TableCell>
                <TableCell><div className="h-4 w-28 animate-pulse rounded bg-muted" /></TableCell>
                <TableCell><div className="h-4 w-28 animate-pulse rounded bg-muted" /></TableCell>
                <TableCell><div className="h-4 w-48 animate-pulse rounded bg-muted" /></TableCell>
                <TableCell><div className="mx-auto h-4 w-16 animate-pulse rounded bg-muted" /></TableCell>
              </TableRow>
            ))
          ) : error ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-sm text-destructive">
                {error}
              </TableCell>
            </TableRow>
          ) : inquilinos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">
                Nenhum inquilino encontrado.
              </TableCell>
            </TableRow>
          ) : (
            inquilinos.map((inquilino) => (
              <TableRow key={inquilino.id}>
                <TableCell className="text-muted-foreground">{inquilino.id}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    inquilino.status
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {inquilino.status ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{inquilino.nome}</TableCell>
                <TableCell>{inquilino.sobrenome}</TableCell>
                <TableCell className="text-muted-foreground">{inquilino.email}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Editar inquilino"
                      onClick={() => onEdit(inquilino)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      aria-label="Excluir inquilino"
                      onClick={() => onDelete(inquilino)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Paginação */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <p className="text-sm text-muted-foreground">
          {totalElements === 0
            ? 'Nenhum resultado'
            : `Mostrando ${start}–${end} de ${totalElements} resultado${totalElements !== 1 ? 's' : ''}`
          }
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Página anterior"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0 || isLoading}
          >
            <ChevronLeft />
          </Button>
          <span className="min-w-[4rem] text-center text-sm text-muted-foreground">
            {totalPages === 0 ? '0 / 0' : `${page + 1} / ${totalPages}`}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Próxima página"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1 || isLoading}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
