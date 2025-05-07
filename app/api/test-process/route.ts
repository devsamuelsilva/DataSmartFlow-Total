import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Obter a lista de produtos do corpo da requisição
    const produtosInput = body.productList || ""

    // Processar a lista: dividir por linhas ou por vírgulas
    let listaProdutos: string[] = []

    // Se for uma string, tentar dividir
    if (typeof produtosInput === "string") {
      const texto = produtosInput.trim()

      // Tentar dividir por quebras de linha
      if (texto.includes("\n")) {
        listaProdutos = texto
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
      }
      // Tentar dividir por vírgulas
      else if (texto.includes(",")) {
        listaProdutos = texto
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      }
      // Tentar dividir por espaços (para listas sem separadores claros)
      else {
        // Dividir o texto em palavras
        const palavras = texto.split(/\s+/)

        // Se temos muitas palavras, tentar agrupar em produtos
        if (palavras.length > 5) {
          // Dividir em grupos de 2-3 palavras
          for (let i = 0; i < palavras.length; i += 3) {
            const grupo = palavras.slice(i, i + 3).join(" ")
            if (grupo.trim()) {
              listaProdutos.push(grupo)
            }
          }
        } else {
          // Se temos poucas palavras, considerar como um único produto
          listaProdutos = [texto]
        }
      }
    } else if (Array.isArray(produtosInput)) {
      // Já é um array, só precisamos garantir que são strings
      listaProdutos = produtosInput.map((p) => String(p).trim()).filter((p) => p.length > 0)
    }

    // Retornar os resultados do processamento
    return NextResponse.json({
      input: produtosInput,
      processed: listaProdutos,
      count: listaProdutos.length,
    })
  } catch (error) {
    console.error("Erro ao testar processamento:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno ao testar processamento" },
      { status: 500 },
    )
  }
}
