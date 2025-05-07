export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { ProductResult } from "@/types/product"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const input = formData.get("input") as string

    if (!input) {
      return NextResponse.json({ error: "No input provided" }, { status: 400 })
    }

    console.log("Processing products for input:", input)

    // Split input by commas or line breaks
    const productNames = input
      .split(/[,\n]/)
      .map((name) => name.trim())
      .filter((name) => name.length > 0)

    if (productNames.length === 0) {
      return NextResponse.json({ error: "No valid product names found" }, { status: 400 })
    }

    // Process each product name
    const results: ProductResult[] = []

    for (const productName of productNames) {
      // Skip empty product names
      if (!productName) continue

      // Check if the product name is numeric (could be an EAN code)
      const isNumeric = /^\d+$/.test(productName)

      let query = supabase.from("produtos").select("*")

      if (isNumeric) {
        // If the input is numeric, we can try an exact match on codauxiliar
        // or a text search on the description
        query = query.or(`codauxiliar.eq.${productName},descricao.ilike.%${productName}%`)
      } else {
        // If the input is not numeric, we only search in the description
        query = query.ilike("descricao", `%${productName}%`)
      }

      // Execute the query with a limit
      const { data, error } = await query.limit(10)

      if (error) {
        console.error("Supabase error:", error)
        continue
      }

      // Add to results
      results.push({
        nomeOriginal: productName,
        correspondencias: data || [],
      })
    }

    return NextResponse.json({ resultados: results })
  } catch (error) {
    console.error("Error processing products:", error)
    return NextResponse.json({ error: "Failed to process products" }, { status: 500 })
  }
}
