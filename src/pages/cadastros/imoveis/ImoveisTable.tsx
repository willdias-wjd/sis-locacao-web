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
import type { Imovel } from './types'

const SKELETON_ROWS = 5

interface ImoveisTableProps {
  imoveis: Imovel[]
  isLoading: boolean
  error: string
  onEdit:   (imovel: Imovel) => void
  onDelete: (imovel: Imovel) => void
}

export function ImoveisTable({
  imoveis,
  isLoading,
  error,
  onEdit,
  onDelete,
}: ImoveisTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead className="w-28">Status</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="w-28">Garagem</TableHead>
            <TableHead className="w-28">Cômodos</TableHead>
            <TableHead className="w-28">Número</TableHead>
            <TableHead className="w-24 text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><div className="h-4 w-8 animate-pulse rounded bg-muted" /></TableCell>
                <TableCell><div className="h-5 w-16 animate-pulse rounded-full bg-muted" /></TableCell>
                <TableCell><div className="h-4 w-48 animate-pulse rounded bg-muted" /></TableCell>
                <TableCell><div className="h-4 w-16 animate-pulse rounded bg-muted" /></TableCell>
                <TableCell><div className="h-4 w-16 animate-pulse rounded bg-muted" /></TableCell>
                <TableCell><div className="h-4 w-20 animate-pulse rounded bg-muted" /></TableCell>
                <TableCell><div className="mx-auto h-4 w-16 animate-pulse rounded bg-muted" /></TableCell>
              </TableRow>
            ))
          ) : error ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-sm text-destructive">
                {error}
              </TableCell>
            </TableRow>
          ) : imoveis.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                Nenhum imóvel cadastrado.
              </TableCell>
            </TableRow>
          ) : (
            imoveis.map((imovel) => (
              <TableRow key={imovel.id}>
                <TableCell className="text-muted-foreground">{imovel.id}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    imovel.status
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {imovel.status ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{imovel.descricao}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    imovel.garagem
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {imovel.garagem ? 'Sim' : 'Não'}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{imovel.comodos}</TableCell>
                <TableCell className="text-muted-foreground">{imovel.numero}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Editar imóvel"
                      onClick={() => onEdit(imovel)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      aria-label="Excluir imóvel"
                      onClick={() => onDelete(imovel)}
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
