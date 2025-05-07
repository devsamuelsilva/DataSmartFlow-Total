// Utilitário para detecção de plataforma e compatibilidade

// Detecta o sistema operacional
export function detectOS(): "windows" | "macos" | "linux" | "ios" | "android" | "unknown" {
  if (typeof window === "undefined") return "unknown"

  const userAgent = window.navigator.userAgent
  const platform = window.navigator.platform

  if (/Win/i.test(platform) || /Windows/i.test(userAgent)) return "windows"
  if (/Mac/i.test(platform) || /MacIntel/i.test(platform) || /Macintosh/i.test(userAgent)) return "macos"
  if (/Linux/i.test(platform)) return "linux"
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios"
  if (/Android/i.test(userAgent)) return "android"

  return "unknown"
}

// Detecta o navegador
export function detectBrowser(): "chrome" | "firefox" | "safari" | "edge" | "ie" | "opera" | "unknown" {
  if (typeof window === "undefined") return "unknown"

  const userAgent = window.navigator.userAgent

  if (/Edg/i.test(userAgent)) return "edge"
  if (/Chrome/i.test(userAgent) && !/Chromium|OPR|Edg/i.test(userAgent)) return "chrome"
  if (/Firefox/i.test(userAgent)) return "firefox"
  if (/Safari/i.test(userAgent) && !/Chrome|Chromium|OPR|Edg/i.test(userAgent)) return "safari"
  if (/OPR/i.test(userAgent) || /Opera/i.test(userAgent)) return "opera"
  if (/Trident/i.test(userAgent) || /MSIE/i.test(userAgent)) return "ie"

  return "unknown"
}

// Normaliza quebras de linha para funcionar em todos os sistemas
export function normalizeLineBreaks(text: string): string {
  // Converte todas as quebras de linha para o formato padrão \n
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
}

// Normaliza texto para processamento consistente
export function normalizeText(text: string): string {
  // Remove caracteres especiais que podem causar problemas
  // Normaliza espaços e quebras de linha
  return normalizeLineBreaks(text).replace(/\s+/g, " ").trim()
}

// Verifica se a plataforma é compatível com a aplicação
export function isPlatformCompatible(): { compatible: boolean; issues: string[] } {
  const issues: string[] = []

  // Verificar recursos essenciais
  if (typeof fetch !== "function") {
    issues.push("Seu navegador não suporta a API Fetch, necessária para comunicação com serviços")
  }

  // Verificar suporte a localStorage
  try {
    localStorage.setItem("test", "test")
    localStorage.removeItem("test")
  } catch (e) {
    issues.push("Seu navegador não suporta ou tem o localStorage desativado")
  }

  // Verificações específicas para Safari no macOS
  const browser = detectBrowser()
  const os = detectOS()

  if (browser === "safari" && os === "macos") {
    // Verificar se o Safari está bloqueando cookies de terceiros
    try {
      document.cookie = "testcookie=1; SameSite=None; Secure"
      if (document.cookie.indexOf("testcookie=") === -1) {
        issues.push("Seu navegador pode estar bloqueando cookies necessários")
      }
    } catch (e) {
      issues.push("Não foi possível verificar as configurações de cookies")
    }
  }

  return {
    compatible: issues.length === 0,
    issues,
  }
}
