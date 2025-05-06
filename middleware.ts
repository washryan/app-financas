import { type NextRequest, NextResponse } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Verificar se o usuário está tentando acessar uma rota protegida
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard")

  // Se o usuário não está autenticado e tenta acessar uma rota protegida
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL("/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Adicionar cabeçalhos para evitar cache
  res.headers.set("Cache-Control", "no-store, max-age=0")

  return res
}

// Configurar quais rotas o middleware deve ser executado
export const config = {
  matcher: ["/dashboard/:path*"],
}
