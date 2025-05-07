// This file should only be imported in server components or API routes
import OpenAI from "openai"
import { cache } from "react"

// Use a different approach to ensure server-side execution
// Instead of calling headers() at the module level

let openaiInstance: OpenAI | null = null

// Use React's cache function to memoize the client
export const getServerOnlyOpenAIClient = cache(() => {
  if (openaiInstance) return openaiInstance

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not defined.")
  }

  openaiInstance = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  return openaiInstance
})
