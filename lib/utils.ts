import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  } catch (error) {
    console.error("Erro ao formatar valor:", error)
    return `R$ ${value.toFixed(2).replace(".", ",")}`
  }
}

// Adicione esta função para formatar a lista de produtos
export function formatProductList(products: any[]): string {
  if (!products || products.length === 0) return "Nenhum produto encontrado"

  return products
    .map((product, index) => {
      return `${index + 1}. ${product.name} - ${formatCurrency(product.price)}`
    })
    .join("\n")
}
