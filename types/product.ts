export interface Product {
  descricao: string // Product name
  codauxiliar: string | number // EAN code - can be string or number
  descricao1?: string // Product type (pill, syrup, etc.)
  fornecedor?: string // Supplier
  marca?: string // Brand/manufacturer
  pvenda: number // Unit price
}

export interface ProductMatch {
  nomeOriginal: string
  correspondencias: Product[]
}

export interface ProductResult {
  nomeOriginal: string
  correspondencias: Product[]
}

export interface ProductWithQuantity extends Product {
  quantidade: number
  total: number
}
