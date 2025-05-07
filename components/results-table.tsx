"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { formatCurrency } from "../lib/utils"

type Product = {
  id: string
  name: string
  price: number
  supplier: string
  category: string
  quantity: number
  code?: string
  brand?: string
  originalName?: string
  suggestedByAI?: boolean
}

interface ResultsTableProps {
  products: Product[]
  onCorrect: (product: Product) => void
  onQuantityChange: (productId: string, quantity: number) => void
}

export function ResultsTable({ products, onCorrect, onQuantityChange }: ResultsTableProps) {
  const [sortField, setSortField] = useState<keyof Product>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    // Garantir que a quantidade seja pelo menos 1
    const quantity = Math.max(1, newQuantity)
    onQuantityChange(productId, quantity)
  }

  const sortedProducts = [...products].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  return (
    <table className="min-w-full divide-y divide-border">
      <thead>
        <tr>
          <th
            className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted cursor-pointer"
            onClick={() => handleSort("originalName")}
          >
            Nome Digitado
            {sortField === "originalName" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
          </th>
          <th
            className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted cursor-pointer"
            onClick={() => handleSort("name")}
          >
            Produto
            {sortField === "name" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
          </th>
          <th
            className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted cursor-pointer"
            onClick={() => handleSort("supplier")}
          >
            Fornecedor
            {sortField === "supplier" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
          </th>
          <th
            className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted cursor-pointer"
            onClick={() => handleSort("brand")}
          >
            Marca
            {sortField === "brand" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
          </th>
          <th
            className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted cursor-pointer"
            onClick={() => handleSort("price")}
          >
            Preço Unit.
            {sortField === "price" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
          </th>
          <th
            className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted cursor-pointer"
            onClick={() => handleSort("quantity")}
          >
            Qtd.
            {sortField === "quantity" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted">
            Subtotal
          </th>
          <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted">
            Código
          </th>
          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted">
            Ações
          </th>
        </tr>
      </thead>
      <tbody className="bg-background divide-y divide-border">
        {sortedProducts.map((product) => (
          <tr
            key={product.id}
            className={`hover:bg-muted/30 ${product.suggestedByAI ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
          >
            <td className="hidden sm:table-cell px-4 py-3 whitespace-nowrap text-sm text-foreground">
              {product.originalName || "-"}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground">
              {product.name}
              {product.suggestedByAI && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  IA
                </span>
              )}
            </td>
            <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm text-foreground">
              {product.supplier}
            </td>
            <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm text-foreground">
              {product.brand || product.category}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">{formatCurrency(product.price)}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
              <div className="flex items-center justify-center space-x-1">
                <button
                  onClick={() => handleQuantityChange(product.id, product.quantity - 1)}
                  className="w-6 h-6 flex items-center justify-center rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                  aria-label="Diminuir quantidade"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={product.quantity}
                  onChange={(e) => handleQuantityChange(product.id, Number.parseInt(e.target.value) || 1)}
                  className="w-10 h-7 text-center border border-input rounded text-sm text-blue-600 font-medium"
                  aria-label="Quantidade"
                />
                <button
                  onClick={() => handleQuantityChange(product.id, product.quantity + 1)}
                  className="w-6 h-6 flex items-center justify-center rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                  aria-label="Aumentar quantidade"
                >
                  +
                </button>
              </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground">
              {formatCurrency(product.price * product.quantity)}
            </td>
            <td className="hidden sm:table-cell px-4 py-3 whitespace-nowrap text-sm text-foreground">
              {product.code || "-"}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
              <Button variant="outline" size="sm" onClick={() => onCorrect(product)}>
                Corrigir
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
