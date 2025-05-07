import { isPlatformCompatible } from "./platform-utils"

// Utilitário para inicialização segura do v0
export function checkBrowserCompatibility(): { compatible: boolean; issues: string[] } {
  // Verificar se estamos no navegador
  if (typeof window === "undefined") {
    return { compatible: true, issues: [] }
  }

  return isPlatformCompatible()
}

// Função para verificar conectividade com a internet
export function checkConnectivity(): Promise<boolean> {
  return new Promise((resolve) => {
    // Se não estamos no navegador, assumimos que estamos online
    if (typeof navigator === "undefined") {
      resolve(true)
      return
    }

    // Verificação rápida do status online
    if (navigator.onLine === false) {
      resolve(false)
      return
    }

    // Tenta fazer uma solicitação para verificar a conectividade real
    fetch("/api/ping", {
      method: "HEAD",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    })
      .then(() => resolve(true))
      .catch(() => {
        // Tenta um fallback para um serviço externo confiável
        fetch("https://www.google.com/favicon.ico", {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        })
          .then(() => resolve(true))
          .catch(() => resolve(false))
      })

    // Define um timeout para a verificação
    setTimeout(() => resolve(navigator.onLine), 3000)
  })
}
