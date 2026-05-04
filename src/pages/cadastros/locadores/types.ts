export interface Locador {
  id: number
  nome: string
  sobrenome: string
  telefone: string | null
  email: string | null
  status: boolean
}

interface Endereco {
  logradouro: string | null
  estado: string | null
  bairro: string | null
  cidade: string | null
  cep: string | null
}

export interface LocadorDetalhe {
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
  endereco: Endereco | null
}
