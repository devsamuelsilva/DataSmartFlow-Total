"use client"

import { useState, useEffect } from "react"
import { Download, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import type { ProductResult, ProductWithQuantity } from "@/types/product"
import * as XLSX from "xlsx"

interface ChatResultTableProps {
  result: ProductResult
}

export function ChatResultTable({ result }: ChatResultTableProps) {
  const [productsWithQuantity, setProductsWithQuantity] = useState<ProductWithQuantity[]>([])
  const [totalValue, setTotalValue] = useState(0)

  useEffect(() => {
    // Initialize products with quantity and total
    const initialProducts = result.correspondencias.map((product) => ({
      ...product,
      quantidade: 1,
      total: product.pvenda,
    }))

    setProductsWithQuantity(initialProducts)

    // Calculate initial total
    const initialTotal = initialProducts.reduce((sum, product) => sum + product.total, 0)
    setTotalValue(initialTotal)
  }, [result.correspondencias])

  const handleQuantityChange = (index: number, value: string) => {
    const quantity = Number.parseInt(value) || 1

    // Ensure quantity is at least 1
    const validQuantity = Math.max(1, quantity)

    setProductsWithQuantity((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        quantidade: validQuantity,
        total: validQuantity * updated[index].pvenda,
      }
      return updated
    })

    // Recalculate total
    setTimeout(() => {
      const newTotal = productsWithQuantity.reduce((sum, product) => sum + product.total, 0)
      setTotalValue(newTotal)
    }, 0)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleExportToExcel = () => {
    try {
      const dataToExport = productsWithQuantity.map((product) => ({
        "Requested Product": result.nomeOriginal,
        Description: product.descricao,
        Code: product.codauxiliar,
        Type: product.descricao1 || "",
        Brand: product.marca || "",
        Supplier: product.fornecedor || "",
        Price: product.pvenda,
        Quantity: product.quantidade,
        Total: product.total,
      }))

      // Add a total row
      dataToExport.push({
        "Requested Product": "",
        Description: "",
        Code: "",
        Type: "",
        Brand: "",
        Supplier: "",
        Price: "",
        Quantity: "Grand Total:",
        Total: totalValue,
      })

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Quotation")

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      // Create download link
      const fileName = `quotation_${result.nomeOriginal.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}.xlsx`
      const url = window.URL.createObjectURL(data)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      link.click()

      // Clean up
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating Excel:", error)
    }
  }

  return (
    <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="font-medium text-gray-800 mb-3">
        🧾 Products found for: <span className="font-bold">"{result.nomeOriginal}"</span>
      </h4>

      {result.correspondencias.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Description</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Brand/Manufacturer</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsWithQuantity.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{product.descricao}</TableCell>
                    <TableCell>{product.codauxiliar}</TableCell>
                    <TableCell>{product.descricao1 || "-"}</TableCell>
                    <TableCell>{product.marca || product.fornecedor || "-"}</TableCell>
                    <TableCell>{formatCurrency(product.pvenda)}</TableCell>
                    <TableCell className="w-24">
                      <Input
                        type="number"
                        min="1"
                        value={product.quantidade}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(product.total)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={5}></TableCell>
                  <TableCell className="font-bold">Total:</TableCell>
                  <TableCell className="font-bold">{formatCurrency(totalValue)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleExportToExcel}>
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="font-medium text-yellow-700">No matches found in the database</span>
          </div>
          <p className="text-sm text-gray-600">
            We couldn't find products matching "{result.nomeOriginal}" in our database.
          </p>
        </div>
      )}
    </div>
  )
}
