"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

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

interface CorrectionFormProps {
  product: Product
  onSave: (product: Product) => void
  onCancel: () => void
}

export function CorrectionForm({ product, onSave, onCancel }: CorrectionFormProps) {
  const [formData, setFormData] = useState<Product>({ ...product })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price"
          ? Number.parseFloat(value) || 0
          : name === "quantity"
            ? Math.max(1, Number.parseInt(value) || 1)
            : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      // Simular um atraso de rede
      await new Promise((resolve) => setTimeout(resolve, 500))

      onSave(formData)
    } catch (error) {
      console.error("Erro ao salvar correção:", error)
      alert("Ocorreu um erro ao salvar as alterações. Por favor, tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg p-6 w-full max-w-md shadow-lg border border-border">
        <h3 className="text-lg font-medium mb-4">Corrigir Produto</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {product.originalName && (
            <div>
              <Label htmlFor="originalName">Nome Digitado</Label>
              <Input
                id="originalName"
                name="originalName"
                value={formData.originalName}
                onChange={handleChange}
                readOnly
                className="bg-muted"
              />
            </div>
          )}

          <div>
            <Label htmlFor="name">Nome do Produto</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Preço Unitário (R$)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                step="1"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="supplier">Fornecedor</Label>
            <Input id="supplier" name="supplier" value={formData.supplier} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" name="brand" value={formData.brand || ""} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input id="category" name="category" value={formData.category} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <Label htmlFor="code">Código</Label>
            <Input id="code" name="code" value={formData.code || ""} onChange={handleChange} />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
