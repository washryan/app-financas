"use client"

import type React from "react"
import type { PostgrestError } from "@supabase/supabase-js"

import { useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { PiggyBank } from "lucide-react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      toast({
        title: "Erro ao registrar",
        description: "As senhas não coincidem",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) {
        throw error
      }

      toast({
        title: "Registro realizado com sucesso!",
        description: "Verifique seu email para confirmar sua conta.",
      })

      // Usar o router do Next.js para navegação do lado do cliente
      router.push("/login")
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : (error as PostgrestError)?.message || "Ocorreu um erro desconhecido"

      toast({
        title: "Erro ao registrar",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted">
      <header className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center">
          <PiggyBank className="h-8 w-8 text-primary mr-2" />
          <span className="font-bold text-xl">Finanças Pessoais</span>
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-lg border-primary/10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
            <CardDescription>Preencha os campos abaixo para criar sua conta</CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                disabled={isLoading}
              >
                {isLoading ? "Registrando..." : "Registrar"}
              </Button>
              <div className="mt-4 text-center text-sm">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                  Faça login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
