import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names into a single string, with Tailwind CSS conflict resolution
 * This utility is used throughout the UI components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as Brazilian currency (BRL)
 */
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

/**
 * Formats a list of products as a string
 */
export function formatProductList(products: any[]): string {
  if (!products || products.length === 0) return "Nenhum produto encontrado"

  return products
    .map((product, index) => {
      return `${index + 1}. ${product.name} - ${formatCurrency(product.price)}`
    })
    .join("\n")
}
