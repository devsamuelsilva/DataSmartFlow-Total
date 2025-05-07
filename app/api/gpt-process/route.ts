// Explicitly set the runtime to nodejs
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import OpenAI from "openai"

// Create a server-side only OpenAI client directly in the API route
// This ensures it's only initialized during request processing
function createOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not defined.")
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()

    // Debug log to inspect the payload
    console.log("[DEBUG] GPT Request Body:", body)

    // Extract the prompt from the body
    const { input } = body

    // ✅ Validation - ensure input exists and is a string
    if (!input || typeof input !== "string") {
      console.error("[SERVER] Invalid or missing input:", input)
      return NextResponse.json({ response: "Invalid or missing input", error: "INVALID_INPUT" }, { status: 400 })
    }

    console.log("[SERVER] Processing valid input:", input.substring(0, 100) + (input.length > 100 ? "..." : ""))

    // Create the OpenAI client during request processing
    const openai = createOpenAIClient()

    // Call the OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a medication sales specialist. For each item sent, generate a table with the found products, containing: description, ean, manufacturer, unit price, quantity (default 1), and total (price × quantity). Always respond in **Markdown table format**. If no product is found, say: 'No match found for [product]'. Add 'Export to Excel' below each table.`,
        },
        {
          role: "user",
          content: `Product list: ${input}`,
        },
      ],
      temperature: 0.4,
    })

    // Extract and return the response
    const response =
      completion.choices[0]?.message?.content ||
      "I understand your request. I'll search for the products you requested."

    console.log("[SERVER] OpenAI response received successfully")

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error("[SERVER] OpenAI API Error:", error.message)
    return NextResponse.json(
      {
        response: "Error processing your request with AI. Using database results only.",
        error: error.message || "Internal GPT server error",
      },
      { status: 500 },
    )
  }
}
