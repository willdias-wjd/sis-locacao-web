export interface Imovel {
  id: number
  descricao: string
  garagem: boolean
  comodos: number
  numero: string
  status: boolean
}

interface Endereco {
  logradouro: string
  estado: string
  bairro: string
  cidade: string
  cep: string
}

export interface ImovelDetalhe {
  id: number
  descricao: string
  garagem: boolean
  comodos: number
  numero: string
  status: boolean
  endereco: Endereco | null
}
