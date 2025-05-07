"use client"

import { useState } from "react"
import { ChatInput } from "@/components/chat-input" // This import path might be incorrect
import { Header } from "@/components/header"
import { GPTAssistant } from "@/components/gpt-assistant"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { processFile } from "@/lib/file-processor"
import type { ProductResult } from "@/types/product"

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ProductResult[]>([])
  const [gptResponse, setGptResponse] = useState<string>("")
  const [showResults, setShowResults] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (input: string, file?: File) => {
    setLoading(true)
    try {
      let productInput = input

      // Process file if provided
      if (file) {
        try {
          const productNames = await processFile(file)
          if (productNames.length > 0) {
            productInput = productNames.join(", ")
          }
        } catch (error) {
          console.error("Error processing file:", error)
          toast({
            title: "Error processing file",
            description: "Could not extract products from the file.",
            variant: "destructive",
          })
        }
      }

      // Process with GPT first - using the API route
      try {
        console.log("Sending request to GPT API...")
        const gptResult = await fetch("/api/gpt-process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: productInput, // ✅ Ensure this is a string
          }),
        })

        if (gptResult.ok) {
          const gptData = await gptResult.json()
          setGptResponse(gptData.response || "I understand your request. I'll search for the requested products.")
          console.log("GPT API response received successfully")
        } else {
          const errorText = await gptResult.text()
          console.warn("Error in GPT API response:", errorText)
          setGptResponse("An error occurred while processing your request. Showing database results only.")
        }
      } catch (gptError) {
        console.error("Error processing with GPT:", gptError)
        setGptResponse("An error occurred while processing your request. Showing database results only.")
      }

      // Process the products from the database
      const formData = new FormData()
      formData.append("input", productInput)
      if (file) {
        formData.append("file", file)
      }

      const response = await fetch("/api/process-products", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        console.error("Product API returned an error:", await response.text())
        throw new Error("Failed to process products")
      }

      const data = await response.json()
      setResults(data.resultados)
      setShowResults(true)
    } catch (error) {
      console.error("Error processing request:", error)
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <h2 className="text-xl font-semibold mb-4">Smart Product Quotation</h2>
            <ChatInput onSubmit={handleSubmit} loading={loading} />
            {showResults && <GPTAssistant response={gptResponse} results={results} />}
          </div>
        </div>
      </div>
      <Toaster />
    </main>
  )
}
