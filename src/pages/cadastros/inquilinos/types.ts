export interface Inquilino {
  id: number
  nome: string
  sobrenome: string
  email: string
  status: boolean
}

export interface InquilinoDetalhe {
  id: number
  nome: string
  sobrenome: string
  cpf: string
  rg: string
  telefone: string | null
  email: string | null
  nacionalidade: string
  estadoCivil: string
  profissao: string | null
  genero: string | null
  dataNascimento: string | null
  status: boolean
}
