import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Configurações ajustáveis
const SIMILARITY_THRESHOLD = 0.1 // Limiar de similaridade para correspondências
const EXACT_MATCH_BONUS = 0.3 // Bônus para correspondências exatas
const COMPONENT_MATCH_BONUS = 0.2 // Bônus para correspondências de componentes

// Função para calcular similaridade entre textos (simplificada)
function calcularSimilaridade(a: string, b: string): number {
  try {
    // Normalizar strings
    const strA = String(a).toLowerCase().trim()
    const strB = String(b).toLowerCase().trim()

    // Verificar correspondência exata
    if (strA === strB) return 1 + EXACT_MATCH_BONUS

    // Verificar se uma string contém a outra
    if (strB.includes(strA)) return 0.8 + COMPONENT_MATCH_BONUS
    if (strA.includes(strB)) return 0.8 + COMPONENT_MATCH_BONUS

    // Dividir em palavras
    const wordsA = strA.split(/\s+/).filter((w) => w.length > 2)
    const wordsB = strB.split(/\s+/).filter((w) => w.length > 2)

    if (!wordsA.length || !wordsB.length) return 0

    // Contar palavras em comum
    const commonWords = wordsA.filter((w) => wordsB.includes(w))
    return commonWords.length / Math.max(wordsA.length, wordsB.length)
  } catch (error) {
    console.error("Erro ao calcular similaridade:", error)
    return 0
  }
}

export async function POST(request: Request) {
  console.log("API de processamento de produtos iniciada")

  try {
    // Parse the request body
    let body
    try {
      body = await request.json()
      console.log("Corpo da requisição analisado com sucesso")
    } catch (parseError) {
      console.error("Erro ao analisar corpo da requisição:", parseError)
      return NextResponse.json(
        {
          error: "Corpo da requisição inválido. Verifique o formato JSON.",
        },
        { status: 400 },
      )
    }

    if (!body) {
      console.error("Corpo da requisição vazio ou inválido")
      return NextResponse.json(
        {
          error: "Corpo da requisição vazio ou inválido",
        },
        { status: 400 },
      )
    }

    const { productList } = body

    if (!productList) {
      console.error("Lista de produtos não fornecida")
      return NextResponse.json(
        {
          error: "Lista de produtos não fornecida",
        },
        { status: 400 },
      )
    }

    // Processar a lista: pode ser string ou array
    let listaProdutos: string[] = []

    if (typeof productList === "string") {
      // Se for uma string, dividir por quebras de linha ou vírgulas
      const texto = productList.trim()

      if (texto.includes("\n")) {
        listaProdutos = texto
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
      } else if (texto.includes(",")) {
        listaProdutos = texto
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      } else {
        // Se não tiver separadores claros, considerar como um único produto
        listaProdutos = [texto]
      }
    } else if (Array.isArray(productList)) {
      // Se já for um array, filtrar itens vazios
      listaProdutos = productList
        .map((item) => (typeof item === "string" ? item.trim() : String(item).trim()))
        .filter((item) => item.length > 0)
    } else {
      console.error("Formato de lista de produtos inválido")
      return NextResponse.json(
        {
          error: "Formato de lista de produtos inválido. Deve ser string ou array.",
        },
        { status: 400 },
      )
    }

    if (listaProdutos.length === 0) {
      console.error("Lista de produtos vazia após processamento")
      return NextResponse.json(
        {
          error: "Lista de produtos vazia após processamento",
        },
        { status: 400 },
      )
    }

    console.log(`Processando ${listaProdutos.length} produtos`)

    // Limitar o número de produtos para evitar sobrecarga
    const limitedProductList = listaProdutos.slice(0, 100)
    if (limitedProductList.length < listaProdutos.length) {
      console.warn(`Lista de produtos limitada de ${listaProdutos.length} para ${limitedProductList.length} itens`)
    }

    try {
      // Verificar se temos as variáveis de ambiente necessárias
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.error("Variáveis de ambiente do Supabase não configuradas")
        throw new Error("Configuração do banco de dados incompleta")
      }

      // Tentar buscar no Supabase
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

      // Array para armazenar os resultados
      const resultados = []
      let totalCotacao = 0

      // Processar cada produto da lista
      for (const produtoOriginal of limitedProductList) {
        console.log("Processando produto:", produtoOriginal)

        // Extrair o primeiro termo para busca
        const primeiroTermo = produtoOriginal.split(" ")[0]

        // Buscar produtos similares no banco
        // ALTERAÇÃO: Removido o filtro .gt("pvenda", 0) para permitir produtos com preço zero
        const { data: produtosSimilares, error } = await supabase
          .from("produtos")
          .select("*")
          .not("pvenda", "is", null)
          .ilike("descricao", `%${primeiroTermo}%`) // Busca pelo primeiro termo
          .limit(50)

        if (error) {
          console.error("Erro ao buscar produtos:", error)
          throw error
        }

        console.log(`Encontrados ${produtosSimilares?.length || 0} produtos similares`)

        if (produtosSimilares && produtosSimilares.length > 0) {
          // Calcular similaridade para cada produto encontrado
          const produtosComSimilaridade = produtosSimilares.map((p) => ({
            ...p,
            similaridade: calcularSimilaridade(produtoOriginal, p.descricao),
          }))

          // Produtos com alta similaridade (acima do limiar)
          const melhores = produtosComSimilaridade
            .filter((p) => p.similaridade >= SIMILARITY_THRESHOLD)
            .sort((a, b) => b.similaridade - a.similaridade)
            .slice(0, 1) // Pegar apenas o melhor resultado

          // Armazenar produtos com baixa similaridade para uso posterior com a IA
          const produtosBaixaSimilaridade = produtosComSimilaridade
            .filter((p) => p.similaridade < SIMILARITY_THRESHOLD && p.similaridade > 0.05)
            .sort((a, b) => b.similaridade - a.similaridade)
            .slice(0, 10) // Pegar os 10 melhores de baixa similaridade

          console.log(
            "Melhores correspondências:",
            melhores.map((p) => ({
              descricao: p.descricao,
              similaridade: p.similaridade.toFixed(2),
            })),
          )

          if (melhores.length > 0) {
            // Adicionar o melhor resultado
            const melhor = melhores[0]

            // Preservar o formato original do preço
            const precoOriginal =
              melhor.pvenda_formatado ||
              `R$ ${typeof melhor.pvenda === "number" ? melhor.pvenda.toFixed(2).replace(".", ",") : melhor.pvenda}`

            resultados.push({
              original: produtoOriginal,
              produto: melhor.descricao || "",
              fornecedor: melhor.fornecedor || "-",
              marca: melhor.marca || "-",
              preco: melhor.pvenda,
              preco_original: precoOriginal,
              codigo: melhor.codauxiliar || "-",
            })

            // Adicionar ao total
            if (typeof melhor.pvenda === "number") {
              totalCotacao += melhor.pvenda
            }
          } else {
            // Nenhum produto com similaridade suficiente
            resultados.push({
              original: produtoOriginal,
              produto: "Produto não encontrado",
              fornecedor: "-",
              marca: "-",
              preco: 0,
              preco_original: "R$ 0,00",
              codigo: "-",
            })
          }
        } else {
          // Nenhum produto encontrado
          resultados.push({
            original: produtoOriginal,
            produto: "Produto não encontrado",
            fornecedor: "-",
            marca: "-",
            preco: 0,
            preco_original: "R$ 0,00",
            codigo: "-",
          })
        }
      }

      console.log("Total de resultados:", resultados.length)
      console.log("Total da cotação:", totalCotacao)

      // Retornar os resultados
      return NextResponse.json({
        results: resultados,
        raw_results: resultados,
        total: Number(totalCotacao.toFixed(2)),
        fromFallback: false,
      })
    } catch (dbError) {
      console.error("Erro ao buscar no banco de dados:", dbError)

      // Usar dados simulados como fallback
      const { generateMockProducts } = await import("../../../lib/mock-data")
      const mockResults = generateMockProducts(limitedProductList)

      const mockTotal = mockResults.reduce((sum, item) => sum + item.preco, 0)

      console.log("Usando dados simulados como fallback")

      return NextResponse.json({
        results: mockResults,
        raw_results: mockResults,
        total: Number(mockTotal.toFixed(2)),
        fromFallback: true,
        error: `Erro ao acessar banco de dados: ${dbError instanceof Error ? dbError.message : "Erro desconhecido"}`,
      })
    }
  } catch (error) {
    console.error("Erro geral no processamento de produtos:", error)
    return NextResponse.json(
      {
        error: `Erro interno do servidor: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      },
      { status: 500 },
    )
  }
}
