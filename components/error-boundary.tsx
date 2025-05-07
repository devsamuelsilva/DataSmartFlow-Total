"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo)

    // Aqui você poderia enviar o erro para um serviço de monitoramento
    // como Sentry, LogRocket, etc.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          {this.props.fallback}
          <div className="mt-4 text-sm text-gray-500">
            <p>Se o problema persistir, tente:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Limpar o cache do navegador</li>
              <li>Verificar sua conexão com a internet</li>
              <li>
                <a href="/diagnostics" className="text-blue-500 hover:underline">
                  Executar diagnóstico
                </a>
              </li>
            </ul>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
