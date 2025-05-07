"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"

export default function TestPage() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleTest = async () => {
    if (!input.trim()) return

    setIsProcessing(true)

    try {
      const response = await fetch("/api/test-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productList: input }),
      })

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Erro:", error)
      setResult({ error: error instanceof Error ? error.message : "Erro desconhecido" })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Teste de Processamento de Lista</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Cole sua lista de produtos:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded min-h-[150px]"
          placeholder="Cole sua lista de produtos aqui..."
        />
      </div>

      <Button onClick={handleTest} disabled={isProcessing || !input.trim()}>
        {isProcessing ? "Processando..." : "Testar Processamento"}
      </Button>

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Resultado:</h2>

          {result.error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">{result.error}</div>
          ) : (
            <div>
              <p className="mb-2">
                Total de produtos identificados: <strong>{result.count}</strong>
              </p>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                <h3 className="font-medium mb-2">Produtos identificados:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {result.processed?.map((produto: string, index: number) => (
                    <li key={index}>{produto}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
