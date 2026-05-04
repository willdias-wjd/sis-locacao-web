import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Locador } from './types'

const SKELETON_ROWS = 5

interface LocadoresTableProps {
  locadores: Locador[]
  isLoading: boolean
  error: string
  onEdit:   (locador: Locador) => void
  onDelete: (locador: Locador) => void
}

export function LocadoresTable({
  locadores,
  isLoading,
  error,
  onEdit,
  onDelete,
}: LocadoresTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead className="w-28">Status</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Sobrenome</TableHead>
            <TableHead>Telefone</TableHead>
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
                <TableCell><div className="h-4 w-32 animate-pulse rounded bg-muted" /></TableCell>
                <TableCell><div className="h-4 w-48 animate-pulse rounded bg-muted" /></TableCell>
                <TableCell><div className="mx-auto h-4 w-16 animate-pulse rounded bg-muted" /></TableCell>
              </TableRow>
            ))
          ) : error ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-sm text-destructive">
                {error}
              </TableCell>
            </TableRow>
          ) : locadores.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                Nenhum locador cadastrado.
              </TableCell>
            </TableRow>
          ) : (
            locadores.map((locador) => (
              <TableRow key={locador.id}>
                <TableCell className="text-muted-foreground">{locador.id}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    locador.status
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {locador.status ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{locador.nome}</TableCell>
                <TableCell>{locador.sobrenome}</TableCell>
                <TableCell className="text-muted-foreground">{locador.telefone ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground">{locador.email ?? '—'}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Editar locador"
                      onClick={() => onEdit(locador)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      aria-label="Excluir locador"
                      onClick={() => onDelete(locador)}
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
    </div>
  )
}
