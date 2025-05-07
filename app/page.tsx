import { ChatInterface } from "../components/chat-interface"
import { AppInitializer } from "../components/app-initializer"
import { ErrorBoundary } from "../components/error-boundary"

export default function Page() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-4 px-2 sm:py-8">
      <div className="w-full max-w-3xl mx-auto mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">Sistema de Cotação de Produtos Total</h1>
        <p className="text-center text-muted-foreground mb-6">
          Bem-vindo ao sistema inteligente de cotação de produtos.
        </p>
      </div>

      <div className="w-full max-w-3xl mx-auto flex-1">
        <ErrorBoundary
          fallback={
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              Ocorreu um erro ao carregar o chat. Por favor, recarregue a página.
            </div>
          }
        >
          <AppInitializer>
            <ChatInterface />
          </AppInitializer>
        </ErrorBoundary>
      </div>
    </div>
  )
}
