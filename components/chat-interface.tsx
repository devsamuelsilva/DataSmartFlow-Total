"use client"

import { useState, useRef, useEffect } from "react"
import { ResultsTable } from "./results-table"
import { CorrectionForm } from "./correction-form"
import { DownloadButton } from "./download-button"
import { formatCurrency } from "../lib/utils"
import { ChatInput } from "./chat-input"

type Message = {
  id?: string
  role: "user" | "assistant"
  content: string
  isProcessing?: boolean
  isError?: boolean
}

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

// Respostas para diferentes tipos de mensagens do usuário (fallback)
const GREETINGS = [
  "Olá! Como posso ajudar com sua cotação hoje?",
  "Oi! Estou aqui para ajudar com suas cotações. Basta enviar sua lista de produtos.",
  "Bom dia! Precisa de uma cotação? Envie sua lista de produtos, um por linha.",
  "Olá! Sou seu assistente de cotações. Como posso ajudar hoje?",
]

const HELP_RESPONSES = [
  "Para obter uma cotação, basta digitar ou colar sua lista de produtos, um por linha. Por exemplo:\nParacetamol 500mg\nDipirona 1g\nIbuprofeno 600mg",
  "Posso ajudar com cotações de produtos. Digite sua lista de produtos, um por linha, e eu buscarei os melhores preços para você.",
  "Para usar o sistema, envie sua lista de produtos (um por linha). Você pode incluir detalhes como dosagem, quantidade e forma farmacêutica para resultados mais precisos.",
]

const FALLBACK_RESPONSES = [
  "Estou aqui para ajudar com cotações de produtos. Envie sua lista de produtos, um por linha, para que eu possa buscar os melhores preços.",
  "Como assistente de cotações, posso ajudar a encontrar os melhores preços para seus produtos. Basta enviar sua lista, um produto por linha.",
  "Para que eu possa ajudar, envie sua lista de produtos para cotação, um por linha. Estou à disposição para buscar os melhores preços para você.",
]

// Função para obter uma resposta de fallback com base na mensagem do usuário
function getFallbackResponse(message: string): string {
  const normalizedMessage = message.toLowerCase().trim()

  // Verificar se é uma saudação
  if (
    normalizedMessage.includes("olá") ||
    normalizedMessage.includes("oi") ||
    normalizedMessage.includes("bom dia") ||
    normalizedMessage.includes("boa tarde") ||
    normalizedMessage.includes("boa noite") ||
    normalizedMessage === "oi" ||
    normalizedMessage === "olá"
  ) {
    return getRandomResponse(GREETINGS)
  }

  // Verificar se é um pedido de ajuda
  if (
    normalizedMessage.includes("ajuda") ||
    normalizedMessage.includes("como funciona") ||
    normalizedMessage.includes("como usar") ||
    normalizedMessage.includes("o que você faz") ||
    normalizedMessage.includes("pode me ajudar")
  ) {
    return getRandomResponse(HELP_RESPONSES)
  }

  // Resposta padrão para outras mensagens
  return getRandomResponse(FALLBACK_RESPONSES)
}

// Função para obter uma resposta aleatória de um array
function getRandomResponse(responses: string[]): string {
  const randomIndex = Math.floor(Math.random() * responses.length)
  return responses[randomIndex]
}

// Função para formatar a tabela Markdown
function formatarTabelaMarkdown(resultados: any[]): string {
  if (!resultados || !Array.isArray(resultados) || resultados.length === 0) {
    return "Nenhum resultado encontrado."
  }

  // Cabeçalho da tabela
  let tabela = "| Nome digitado | Produto | Fornecedor | Marca | Preço | Quantidade | Subtotal | Código |\n"
  tabela += "| --- | --- | --- | --- | --- | --- | --- | --- |\n"

  // Adicionar cada linha
  for (const r of resultados) {
    if (!r) continue

    // Usar o preço exatamente como está no banco
    const preco = r.preco_original || `R$ ${r.preco}`.replace(".", ",")

    // Calcular o subtotal
    const quantidade = r.quantidade || 1
    const subtotal = `R$ ${(r.preco * quantidade).toFixed(2).replace(".", ",")}`

    // Garantir que todos os campos existam para evitar undefined
    const original = r.original || "-"
    const produto = r.produto || "-"
    const fornecedor = r.fornecedor || "-"
    const marca = r.marca || "-"
    const codigo = r.codigo || "-"

    tabela += `| ${original} | ${produto} | ${fornecedor} | ${marca} | ${preco} | ${quantidade} | ${subtotal} | ${codigo} |\n`
  }

  return tabela
}

// Função para converter resultados brutos em produtos
function convertRawResultsToProducts(rawResults: any[]): Product[] {
  if (!rawResults || !Array.isArray(rawResults)) return []

  return rawResults.map((item, index) => ({
    id: `prod-${index}`,
    name: item.produto || "Produto sem nome",
    price: typeof item.preco === "number" ? item.preco : Number.parseFloat(String(item.preco)) || 0,
    supplier: item.fornecedor || "-",
    category: item.marca || "-",
    brand: item.marca || "-",
    code: item.codigo || "-",
    originalName: item.original || "-",
    suggestedByAI: item.sugeridoPorIA || false,
    quantity: 1, // Inicializar quantidade como 1
  }))
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! Envie uma lista de produtos para obter cotações.",
    },
  ])
  const [isProcessing, setIsProcessing] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [totalValue, setTotalValue] = useState<number | null>(null)
  const [showCorrection, setShowCorrection] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Função para calcular o total considerando a quantidade
  const calculateTotal = (products: Product[]) => {
    return products.reduce((sum, product) => sum + product.price * product.quantity, 0)
  }

  // Função para enviar mensagem
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    // Adiciona mensagem do usuário ao chat
    setMessages((prev) => [...prev, { role: "user", content: message }])

    setIsProcessing(true)

    try {
      // Adiciona mensagem de processamento
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Processando sua lista de produtos...",
          isProcessing: true,
        },
      ])

      console.log("Enviando lista de produtos:", message)

      // Verificar se é uma mensagem simples ou uma lista de produtos
      if (message.split("\n").length <= 1 && !message.includes(",") && message.split(" ").length <= 5) {
        // Provavelmente é uma mensagem simples, não uma lista de produtos
        // Remover a mensagem de processamento
        setMessages((prev) => prev.filter((msg) => !msg.isProcessing))

        // Adicionar resposta de fallback
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: getFallbackResponse(message),
          },
        ])

        setIsProcessing(false)
        return
      }

      // Preparar a lista de produtos para envio
      let productList = message

      // Garantir que a lista de produtos está em um formato adequado
      if (typeof productList === "string") {
        // Remover espaços extras e linhas vazias
        productList = productList
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .join("\n")
      }

      // Envia para API com tratamento de erro aprimorado
      try {
        const response = await fetch("/api/process-products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ productList }),
        })

        // Verificar se a resposta é JSON válido
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Resposta da API não é JSON válido")
        }

        const data = await response.json()

        if (!response.ok) {
          // Se a resposta contém uma mensagem de erro, usá-la
          if (data && data.error) {
            throw new Error(data.error)
          } else {
            throw new Error(`Erro na API: ${response.status}`)
          }
        }

        console.log("Resposta da API:", data)

        // Remove a mensagem de processamento
        setMessages((prev) => prev.filter((msg) => !msg.isProcessing))

        // Processar os resultados
        const resultsArray = data.results || data.raw_results || []

        if (resultsArray && Array.isArray(resultsArray) && resultsArray.length > 0) {
          console.log("Resultados recebidos da API:", resultsArray)

          // Converter resultados em produtos
          const processedProducts = convertRawResultsToProducts(resultsArray)

          if (processedProducts.length > 0) {
            setProducts(processedProducts)

            // Calcular o total considerando a quantidade
            const calculatedTotal = calculateTotal(processedProducts)
            setTotalValue(calculatedTotal)

            // Formatar a tabela Markdown (apenas para exportação, não exibir no chat)
            const tabelaFormatada = formatarTabelaMarkdown(resultsArray)

            // Adicionar apenas uma mensagem de confirmação ao chat, sem a tabela
            const fromAI = data.fromAI || false
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: `Cotação concluída com sucesso! ${processedProducts.length} produtos encontrados.
${fromAI ? "\n**Alguns produtos foram sugeridos pela IA com base na sua pesquisa.**" : ""}

**Total: ${formatCurrency(calculatedTotal)}**`,
              },
            ])
          } else {
            throw new Error("Não foi possível processar os resultados")
          }
        } else {
          throw new Error("Formato de resposta inválido ou nenhum resultado encontrado")
        }
      } catch (apiError) {
        console.error("Erro na chamada da API:", apiError)
        throw apiError
      }
    } catch (error) {
      console.error("Erro:", error)

      // Remove a mensagem de processamento
      setMessages((prev) => prev.filter((msg) => !msg.isProcessing))

      // Adicionar mensagem de erro mais detalhada
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Ocorreu um erro ao processar sua lista: ${error instanceof Error ? error.message : "Erro desconhecido"}. 
          
Por favor, tente novamente com uma lista mais simples ou entre em contato com o suporte se o problema persistir.`,
          isError: true,
        },
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCorrection = (product: Product) => {
    setSelectedProduct(product)
    setShowCorrection(true)
  }

  const handleSaveCorrection = (updatedProduct: Product) => {
    // Garantir que a quantidade seja preservada na correção
    const quantity = selectedProduct?.quantity || 1
    const productWithQuantity = { ...updatedProduct, quantity }

    setProducts((prevProducts) => prevProducts.map((p) => (p.id === productWithQuantity.id ? productWithQuantity : p)))

    // Recalcular o total
    const newProducts = products.map((p) => (p.id === productWithQuantity.id ? productWithQuantity : p))
    const newTotal = calculateTotal(newProducts)
    setTotalValue(newTotal)

    setShowCorrection(false)
    setSelectedProduct(null)

    // Adiciona mensagem de confirmação
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Produto "${updatedProduct.name}" atualizado com sucesso.`,
      },
    ])
  }

  const handleCancelCorrection = () => {
    setShowCorrection(false)
    setSelectedProduct(null)
  }

  // Função para atualizar a quantidade de um produto
  const handleQuantityChange = (productId: string, quantity: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => (product.id === productId ? { ...product, quantity } : product)),
    )

    // Recalcular o total
    const updatedProducts = products.map((product) => (product.id === productId ? { ...product, quantity } : product))
    const newTotal = calculateTotal(updatedProducts)
    setTotalValue(newTotal)
  }

  // Rola para o final das mensagens quando novas mensagens são adicionadas
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-200px)] bg-background border border-border rounded-lg overflow-hidden shadow-sm">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background scrollbar-thin">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`rounded-lg p-3 max-w-[80%] ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : message.isError
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-secondary text-secondary-foreground"
              } ${message.isProcessing ? "animate-pulse" : ""}`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              {message.isProcessing && (
                <div className="mt-2 flex space-x-1 justify-center">
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ))}

        {products.length > 0 && (
          <div className="my-4 w-full">
            <div className="w-full overflow-x-auto rounded-lg border border-border shadow-sm">
              <ResultsTable products={products} onCorrect={handleCorrection} onQuantityChange={handleQuantityChange} />
            </div>
            <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
              <div className="text-lg font-semibold">Total: {formatCurrency(totalValue || 0)}</div>
              <DownloadButton products={products} total={totalValue || 0} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showCorrection && selectedProduct && (
        <CorrectionForm product={selectedProduct} onSave={handleSaveCorrection} onCancel={handleCancelCorrection} />
      )}

      <div className="border-t border-border p-3 bg-background">
        <ChatInput onSendMessage={handleSendMessage} isDisabled={isProcessing} />
      </div>
    </div>
  )
}
