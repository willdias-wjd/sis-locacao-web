import { useEffect, useState } from 'react'
import axios from 'axios'
import api from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Imovel, ImovelDetalhe } from './types'
import { Field } from '@/components/field/field'
import { FormSkeleton } from '@/components/formSkeleton'

// ─── Tipos do formulário ──────────────────────────────────────────────────────

interface FormData {
  descricao: string
  garagem: string
  comodos: string
  numero: string
  logradouro: string
  estado: string
  bairro: string
  cidade: string
  cep: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

const INITIAL: FormData = {
  descricao: '',
  garagem: '',
  comodos: '',
  numero: '',
  logradouro: '',
  estado: '',
  bairro: '',
  cidade: '',
  cep: '',
}

// ─── Validação ────────────────────────────────────────────────────────────────

function validate(data: FormData): FormErrors {
  const errs: FormErrors = {}
  if (!data.descricao.trim())   errs.descricao  = 'O campo descrição é obrigatório'
  if (!data.garagem)            errs.garagem    = 'O campo garagem é obrigatório'
  if (!data.numero.trim())      errs.numero     = 'O campo número é obrigatório'
  if (!data.comodos.trim()) {
    errs.comodos = 'O campo cômodos é obrigatório'
  } else if (isNaN(Number(data.comodos)) || Number(data.comodos) <= 0) {
    errs.comodos = 'Cômodos deve ser um número maior que zero'
  }
  if (!data.logradouro.trim())  errs.logradouro = 'O campo logradouro é obrigatório'
  if (!data.bairro.trim())      errs.bairro     = 'O campo bairro é obrigatório'
  if (!data.cidade.trim())      errs.cidade     = 'O campo cidade é obrigatório'
  if (!data.estado.trim())      errs.estado     = 'O campo estado é obrigatório'
  if (!data.cep.trim())         errs.cep        = 'O campo CEP é obrigatório'
  return errs
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ImovelFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null = modo criação | number = modo edição */
  imovelId: number | null
  onSuccess: (imovel: Imovel) => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function ImovelFormModal({
  open,
  onOpenChange,
  imovelId,
  onSuccess,
}: ImovelFormModalProps) {
  const isEditing = imovelId !== null
  const { toast } = useToast()

  const [form, setForm]             = useState<FormData>(INITIAL)
  const [errors, setErrors]         = useState<FormErrors>({})
  const [isFetching, setIsFetching] = useState(false)
  const [isLoading, setIsLoading]   = useState(false)

  useEffect(() => {
    if (!open) {
      setForm(INITIAL)
      setErrors({})
      return
    }

    if (!isEditing) return

    setIsFetching(true)
    api
      .get<ImovelDetalhe>(`/imovel/${imovelId}`)
      .then(({ data }) => {
        setForm({
          descricao:  data.descricao              ?? '',
          garagem:    String(data.garagem),
          comodos:    String(data.comodos),
          numero:     data.numero                 ?? '',
          logradouro: data.endereco?.logradouro   ?? '',
          estado:     data.endereco?.estado       ?? '',
          bairro:     data.endereco?.bairro       ?? '',
          cidade:     data.endereco?.cidade       ?? '',
          cep:        data.endereco?.cep          ?? '',
        })
      })
      .catch(() => {
        toast('Erro ao carregar dados', { description: 'Não foi possível carregar os dados do imóvel.', variant: 'error' })
        onOpenChange(false)
      })
      .finally(() => setIsFetching(false))
  }, [open, isEditing, imovelId])

  function set(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const errs = validate(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setIsLoading(true)
    try {
      const payload = {
        descricao: form.descricao,
        garagem:   form.garagem === 'true',
        comodos:   Number(form.comodos),
        numero:    form.numero,
        endereco: {
          logradouro: form.logradouro,
          estado:     form.estado,
          bairro:     form.bairro,
          cidade:     form.cidade,
          cep:        form.cep,
        },
      }

      const { data } = isEditing
        ? await api.put<Imovel>(`/imovel/${imovelId}`, payload)
        : await api.post<Imovel>('/imovel', payload)

      onSuccess(data)
      onOpenChange(false)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          const body = err.response.data as { message?: string; error?: string } | undefined
          if (body?.message) {
            toast(body.error ?? 'Erro de validação', { description: body.message, variant: 'error' })
          } else if (body && typeof body === 'object' && !Array.isArray(body)) {
            setErrors(body as FormErrors)
            toast('Verifique os dados informados', { description: 'Corrija os campos destacados e tente novamente.', variant: 'error' })
          } else {
            toast('Dados inválidos', { description: 'Verifique os dados e tente novamente.', variant: 'error' })
          }
        } else if (!err.response) {
          toast('Sem conexão', { description: 'Não foi possível conectar ao servidor.', variant: 'error' })
        } else {
          toast('Erro ao salvar', { description: 'Ocorreu um erro inesperado. Tente novamente.', variant: 'error' })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const title       = isEditing ? 'Editar Imóvel'    : 'Novo Imóvel'
  const description = isEditing ? 'Altere os dados do imóvel.' : 'Preencha os dados para cadastrar um novo imóvel.'
  const submitLabel = isEditing ? 'Alterar imóvel'   : 'Salvar imóvel'

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            {isFetching ? (
              <FormSkeleton />
            ) : (
              <>
                <Field label="Descrição *" error={errors.descricao}>
                  <Input
                    placeholder="Casa com 3 quartos"
                    value={form.descricao}
                    onChange={e => set('descricao', e.target.value)}
                    aria-invalid={!!errors.descricao}
                  />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Garagem *" error={errors.garagem}>
                    <SelectRoot value={form.garagem} onValueChange={v => set('garagem', v)}>
                      <SelectTrigger aria-invalid={!!errors.garagem}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Sim</SelectItem>
                        <SelectItem value="false">Não</SelectItem>
                      </SelectContent>
                    </SelectRoot>
                  </Field>

                  <Field label="Cômodos *" error={errors.comodos}>
                    <Input
                      type="number"
                      min={1}
                      placeholder="3"
                      value={form.comodos}
                      onChange={e => set('comodos', e.target.value)}
                      aria-invalid={!!errors.comodos}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Número *" error={errors.numero}>
                    <Input
                      placeholder="123"
                      value={form.numero}
                      onChange={e => set('numero', e.target.value)}
                      aria-invalid={!!errors.numero}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Logradouro *" error={errors.logradouro}>
                    <Input
                      placeholder="Rua das Flores, 123"
                      value={form.logradouro}
                      onChange={e => set('logradouro', e.target.value)}
                      aria-invalid={!!errors.logradouro}
                    />
                  </Field>
                  <Field label="Bairro *" error={errors.bairro}>
                    <Input
                      placeholder="Centro"
                      value={form.bairro}
                      onChange={e => set('bairro', e.target.value)}
                      aria-invalid={!!errors.bairro}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Cidade *" error={errors.cidade}>
                    <Input
                      placeholder="São Paulo"
                      value={form.cidade}
                      onChange={e => set('cidade', e.target.value)}
                      aria-invalid={!!errors.cidade}
                    />
                  </Field>
                  <Field label="Estado *" error={errors.estado}>
                    <Input
                      placeholder="SP"
                      value={form.estado}
                      onChange={e => set('estado', e.target.value)}
                      aria-invalid={!!errors.estado}
                      maxLength={2}
                    />
                  </Field>
                  <Field label="CEP *" error={errors.cep}>
                    <Input
                      placeholder="00000-000"
                      value={form.cep}
                      onChange={e => set('cep', e.target.value)}
                      aria-invalid={!!errors.cep}
                    />
                  </Field>
                </div>
              </>
            )}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
              disabled={isLoading || isFetching}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || isFetching}>
              {isLoading ? 'Salvando…' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  )
}
