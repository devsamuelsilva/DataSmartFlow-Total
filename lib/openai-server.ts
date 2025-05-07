import OpenAI from "openai"

// Simple function to create an OpenAI client
// This should only be used in server contexts
export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not defined.")
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}
