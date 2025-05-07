"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Download } from "lucide-react"
import ExcelJS from "exceljs"

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

interface DownloadButtonProps {
  products: Product[]
  total: number
}

export function DownloadButton({ products, total }: DownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    if (products.length === 0) return

    try {
      setIsGenerating(true)

      // Criar uma nova planilha
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Cotação de Produtos")

      // Adicionar cabeçalhos
      worksheet.columns = [
        { header: "Produto", key: "name", width: 30 },
        { header: "Preço Unit. (R$)", key: "price", width: 15 },
        { header: "Quantidade", key: "quantity", width: 12 },
        { header: "Subtotal (R$)", key: "subtotal", width: 15 },
        { header: "Fornecedor", key: "supplier", width: 20 },
        { header: "Marca", key: "brand", width: 20 },
        { header: "Categoria", key: "category", width: 20 },
        { header: "Código", key: "code", width: 15 },
      ]

      // Estilizar cabeçalhos
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      }

      // Adicionar dados
      products.forEach((product) => {
        // Não incluir produtos não encontrados na exportação
        if (product.name !== "Produto não encontrado") {
          worksheet.addRow({
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            subtotal: product.price * product.quantity,
            supplier: product.supplier,
            brand: product.brand || "",
            category: product.category,
            code: product.code || "",
          })
        }
      })

      // Formatar colunas de preço
      worksheet.getColumn("price").numFmt = "R$ #,##0.00"
      worksheet.getColumn("subtotal").numFmt = "R$ #,##0.00"

      // Adicionar linha em branco
      worksheet.addRow({})

      // Adicionar total
      const totalRow = worksheet.addRow({
        name: "TOTAL",
        subtotal: total,
      })
      totalRow.font = { bold: true }

      // Mesclar células para o total
      worksheet.mergeCells(`A${totalRow.number}:C${totalRow.number}`)

      // Gerar o arquivo
      const buffer = await workbook.xlsx.writeBuffer()

      // Criar um blob e fazer o download
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `cotacao_produtos_${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(a)
      a.click()

      // Limpar
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erro ao gerar planilha:", error)
      alert("Ocorreu um erro ao gerar a planilha. Por favor, tente novamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating || products.length === 0}
      className="flex items-center space-x-1"
      variant="secondary"
    >
      <Download size={16} className="mr-1" />
      <span>{isGenerating ? "Gerando..." : "Baixar Excel"}</span>
    </Button>
  )
}
