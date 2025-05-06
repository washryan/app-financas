import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { DashboardLayout } from "@/components/dashboard-layout"
import type { Database } from "@/types/supabase"

export default async function Layout({ children }: { children: React.ReactNode }) {
  // Usar cookies() diretamente para obter os cookies
  const cookieStore = cookies()

  // Criar cliente Supabase com os cookies
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

  try {
    // Verificar a sessão
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Se não houver sessão, redirecionar para o login
    if (!session) {
      console.log("Sessão não encontrada, redirecionando para login")
      redirect("/login")
    }

    // Se houver sessão, renderizar o layout do dashboard
    return <DashboardLayout>{children}</DashboardLayout>
  } catch (error) {
    console.error("Erro ao verificar sessão:", error)
    // Em caso de erro, redirecionar para o login
    redirect("/login")
  }
}
