"use client"

import { useState, useEffect, type ReactNode } from "react"
import { checkBrowserCompatibility } from "../lib/v0-initializer"
// Adicionar importação das utilidades de plataforma
import { detectOS, detectBrowser } from "../lib/platform-utils"

interface AppInitializerProps {
  children: ReactNode
}

export function AppInitializer({ children }: AppInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  // Adicionar estado para armazenar informações da plataforma
  const [platformInfo, setPlatformInfo] = useState<{ os: string; browser: string }>({
    os: "desconhecido",
    browser: "desconhecido",
  })

  useEffect(() => {
    const initialize = async () => {
      try {
        // Verificar compatibilidade do navegador
        const { compatible, issues } = checkBrowserCompatibility()

        if (!compatible) {
          setError(`Problemas de compatibilidade detectados: ${issues.join(", ")}`)
          return
        }

        // Verificar conectividade
        setIsOnline(navigator.onLine)

        // Dentro da função initialize, antes de setIsInitialized(true):
        // Detectar plataforma
        const os = detectOS()
        const browser = detectBrowser()
        setPlatformInfo({ os, browser })
        console.log(`Plataforma detectada: ${os}, Navegador: ${browser}`)

        // Inicialização bem-sucedida
        setIsInitialized(true)
      } catch (err) {
        console.error("Erro na inicialização:", err)
        setError("Falha ao inicializar a aplicação. Por favor, recarregue a página.")
      }
    }

    initialize()

    // Monitorar status online/offline
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-medium text-red-800">Erro de Inicialização</h3>
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Modificar o retorno quando não está online para incluir informações da plataforma:
  if (!isOnline) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="text-lg font-medium text-yellow-800">Modo Offline</h3>
        <p className="text-yellow-700">Você está offline. Algumas funcionalidades podem estar limitadas.</p>
        <p className="text-xs text-yellow-600 mt-1">
          Sistema: {platformInfo.os}, Navegador: {platformInfo.browser}
        </p>
        {children}
      </div>
    )
  }

  // Modificar o retorno normal para incluir informações da plataforma em modo de desenvolvimento:
  return (
    <>
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-gray-500 text-center mb-2">
          Sistema: {platformInfo.os}, Navegador: {platformInfo.browser}
        </div>
      )}
      {children}
    </>
  )
}
