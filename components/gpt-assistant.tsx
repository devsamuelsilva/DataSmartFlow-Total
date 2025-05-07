import { Bot } from "lucide-react"
import type { ProductResult } from "@/types/product"
import { ChatResultTable } from "@/components/chat-result-table"

interface GPTAssistantProps {
  response: string
  results: ProductResult[]
}

export function GPTAssistant({ response, results }: GPTAssistantProps) {
  return (
    <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-blue-800">AI Assistant</h3>

          <div className="mt-1 text-gray-700">
            {/* Display the AI response */}
            <p className="whitespace-pre-line">{response}</p>

            <div className="mt-4">
              {results.length > 0 ? (
                results.map((result, index) => <ChatResultTable key={index} result={result} />)
              ) : (
                <p className="mt-2 text-gray-500">
                  No products matching your search were found. Please try with other terms or check the spelling.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
