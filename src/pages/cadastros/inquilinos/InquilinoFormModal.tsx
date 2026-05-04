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
import type { Inquilino, InquilinoDetalhe } from './types'
import { Field } from '@/components/field/field'
import { FormSkeleton } from '@/components/formSkeleton'

// ─── Tipos do formulário ──────────────────────────────────────────────────────

interface FormData {
  nome: string
  sobrenome: string
  cpf: string
  rg: string
  telefone: string
  email: string
  nacionalidade: string
  estadoCivil: string
  profissao: string
  genero: string
  dataNascimento: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

const INITIAL: FormData = {
  nome: '', sobrenome: '', cpf: '', rg: '',
  telefone: '', email: '', nacionalidade: '',
  estadoCivil: '', profissao: '', genero: '', dataNascimento: '',
}

// ─── Validação ────────────────────────────────────────────────────────────────

const CPF_REGEX   = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(data: FormData): FormErrors {
  const errs: FormErrors = {}
  if (!data.nome.trim())          errs.nome          = 'O campo nome é obrigatório'
  if (!data.sobrenome.trim())     errs.sobrenome     = 'O campo sobrenome é obrigatório'
  if (!data.cpf.trim())           errs.cpf           = 'O campo CPF é obrigatório'
  else if (!CPF_REGEX.test(data.cpf.trim())) errs.cpf = 'CPF inválido (ex: 000.000.000-00)'
  if (!data.rg.trim())            errs.rg            = 'O campo RG é obrigatório'
  if (!data.nacionalidade.trim()) errs.nacionalidade = 'O campo nacionalidade é obrigatório'
  if (!data.estadoCivil)          errs.estadoCivil   = 'O campo estado civil é obrigatório'
  if (data.email && !EMAIL_REGEX.test(data.email))
    errs.email = 'E-mail deve estar em um formato válido'
  if (data.dataNascimento) {
    const picked = new Date(data.dataNascimento + 'T00:00:00')
    if (picked > new Date()) errs.dataNascimento = 'Data de nascimento não pode ser futura'
  }
  return errs
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface InquilinoFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null = modo criação | number = modo edição */
  inquilinoId: number | null
  onSuccess: (inquilino: Inquilino) => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function InquilinoFormModal({
  open,
  onOpenChange,
  inquilinoId,
  onSuccess,
}: InquilinoFormModalProps) {
  const isEditing = inquilinoId !== null
  const { toast } = useToast()

  const [form, setForm]       = useState<FormData>(INITIAL)
  const [errors, setErrors]   = useState<FormErrors>({})
  const [isFetching, setIsFetching] = useState(false)
  const [isLoading, setIsLoading]   = useState(false)

  // Ao abrir em modo edição: busca os dados completos do inquilino
  useEffect(() => {
    if (!open) {
      setForm(INITIAL)
      setErrors({})
      return
    }

    if (!isEditing) return

    setIsFetching(true)
    api
      .get<InquilinoDetalhe>(`/inquilinos/${inquilinoId}`)
      .then(({ data }) => {
        setForm({
          nome:           data.nome          ?? '',
          sobrenome:      data.sobrenome     ?? '',
          cpf:            data.cpf           ?? '',
          rg:             data.rg            ?? '',
          telefone:       data.telefone      ?? '',
          email:          data.email         ?? '',
          nacionalidade:  data.nacionalidade ?? '',
          estadoCivil:    data.estadoCivil   ?? '',
          profissao:      data.profissao     ?? '',
          genero:         data.genero        ?? '',
          dataNascimento: data.dataNascimento ?? '',
        })
      })
      .catch(() => {
        toast('Erro ao carregar dados', { description: 'Não foi possível carregar os dados do inquilino.', variant: 'error' })
        onOpenChange(false)
      })
      .finally(() => setIsFetching(false))
  }, [open, isEditing, inquilinoId])

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
        ...form,
        dataNascimento: form.dataNascimento || null,
        telefone:       form.telefone       || null,
        email:          form.email          || null,
        profissao:      form.profissao      || null,
        genero:         form.genero         || null,
      }

      const { data } = isEditing
        ? await api.put<Inquilino>(`/inquilinos/${inquilinoId}`, payload)
        : await api.post<Inquilino>('/inquilinos', payload)

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

  const title       = isEditing ? 'Editar Inquilino'   : 'Novo Inquilino'
  const description = isEditing ? 'Altere os dados do inquilino.' : 'Preencha os dados para cadastrar um novo inquilino.'
  const submitLabel = isEditing ? 'Alterar inquilino'  : 'Salvar inquilino'

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Nome *" error={errors.nome}>
                    <Input placeholder="João" value={form.nome}
                      onChange={e => set('nome', e.target.value)} aria-invalid={!!errors.nome} />
                  </Field>
                  <Field label="Sobrenome *" error={errors.sobrenome}>
                    <Input placeholder="Silva" value={form.sobrenome}
                      onChange={e => set('sobrenome', e.target.value)} aria-invalid={!!errors.sobrenome} />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="CPF *" error={errors.cpf}>
                    <Input placeholder="000.000.000-00" value={form.cpf}
                      onChange={e => set('cpf', e.target.value)} aria-invalid={!!errors.cpf} />
                  </Field>
                  <Field label="RG *" error={errors.rg}>
                    <Input placeholder="0000000" value={form.rg}
                      onChange={e => set('rg', e.target.value)} aria-invalid={!!errors.rg} />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Telefone" error={errors.telefone}>
                    <Input placeholder="(00) 00000-0000" value={form.telefone}
                      onChange={e => set('telefone', e.target.value)} />
                  </Field>
                  <Field label="E-mail" error={errors.email}>
                    <Input type="email" placeholder="joao@email.com" value={form.email}
                      onChange={e => set('email', e.target.value)} aria-invalid={!!errors.email} />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Nacionalidade *" error={errors.nacionalidade}>
                    <Input placeholder="Brasileiro(a)" value={form.nacionalidade}
                      onChange={e => set('nacionalidade', e.target.value)} aria-invalid={!!errors.nacionalidade} />
                  </Field>
                  <Field label="Estado Civil *" error={errors.estadoCivil}>
                    <SelectRoot value={form.estadoCivil} onValueChange={v => set('estadoCivil', v)}>
                      <SelectTrigger aria-invalid={!!errors.estadoCivil}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                        <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                        <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                        <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                        <SelectItem value="União Estável">União Estável</SelectItem>
                      </SelectContent>
                    </SelectRoot>
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Profissão" error={errors.profissao}>
                    <Input placeholder="Engenheiro(a)" value={form.profissao}
                      onChange={e => set('profissao', e.target.value)} />
                  </Field>
                  <Field label="Gênero" error={errors.genero}>
                    <SelectRoot value={form.genero} onValueChange={v => set('genero', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Feminino">Feminino</SelectItem>
                        <SelectItem value="Não informado">Não informado</SelectItem>
                      </SelectContent>
                    </SelectRoot>
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Data de Nascimento" error={errors.dataNascimento}>
                    <Input type="date" value={form.dataNascimento}
                      onChange={e => set('dataNascimento', e.target.value)} aria-invalid={!!errors.dataNascimento} />
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