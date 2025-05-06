"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Função para limpar os cookies do navegador relacionados ao Supabase
export function clearSupabaseCookies() {
  // Lista de possíveis cookies do Supabase
  const cookiesToClear = [
    "sb-access-token",
    "sb-refresh-token",
    "supabase-auth-token",
    "__session",
    "sb-provider-token",
  ]

  // Obter todos os cookies
  const cookies = document.cookie.split(";")

  // Para cada cookie do Supabase, limpar
  cookiesToClear.forEach((cookieName) => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  })

  // Também limpar qualquer cookie que comece com 'sb-'
  cookies.forEach((cookie) => {
    const cookieParts = cookie.split("=")
    const name = cookieParts[0].trim()
    if (name.startsWith("sb-")) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    }
  })
}

// Função para fazer logout completo
export async function fullLogout() {
  const supabase = createClientComponentClient<Database>()

  // Fazer logout no Supabase
  await supabase.auth.signOut()

  // Limpar cookies
  clearSupabaseCookies()

  // Limpar localStorage
  localStorage.removeItem("supabase.auth.token")

  // Redirecionar para a página inicial
  window.location.href = "/"
}
