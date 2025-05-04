"use client"

import type React from "react"
import type { PostgrestError, User } from "@supabase/supabase-js"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { defaultCategories } from "@/lib/utils"
import Link from "next/link"

interface Profile {
  name: string
  email: string
}

export default function SettingsPage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSeedingCategories, setSeedingCategories] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
  })

  useEffect(() => {
    const getProfile = async () => {
      try {
        // Obter usuário atual
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setUser(user)

          // Buscar perfil
          const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()

          if (data) {
            setProfile({
              name: data.name || "",
              email: data.email || user.email || "",
            })
          }
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error)
      }
    }

    getProfile()
  }, [supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      // Atualizar perfil
      const { error } = await supabase
        .from("profiles")
        .update({
          name: profile.name,
        })
        .eq("id", user.id)

      if (error) {
        throw error
      }

      toast({
        title: "Perfil atualizado com sucesso!",
      })
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : (error as PostgrestError)?.message || "Ocorreu um erro desconhecido"

      toast({
        title: "Erro ao atualizar perfil",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSeedCategories = async () => {
    setSeedingCategories(true)

    try {
      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      // Verificar categorias existentes
      const { data: existingCategories } = await supabase.from("categories").select("count")

      if (existingCategories && existingCategories.length > 0) {
        const confirmSeed = window.confirm(
          "Você já possui categorias cadastradas. Deseja adicionar as categorias padrão mesmo assim?",
        )

        if (!confirmSeed) {
          setSeedingCategories(false)
          return
        }
      }

      // Adicionar categorias padrão
      const categoriesToInsert = defaultCategories.map((category) => ({
        ...category,
        user_id: user.id,
      }))

      const { error } = await supabase.from("categories").insert(categoriesToInsert)

      if (error) {
        throw error
      }

      toast({
        title: "Categorias padrão adicionadas com sucesso!",
        description: "As categorias foram adicionadas ao seu perfil.",
      })
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : (error as PostgrestError)?.message || "Ocorreu um erro desconhecido"

      toast({
        title: "Erro ao adicionar categorias",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSeedingCategories(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas configurações e preferências</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
          <TabsTrigger value="account">Conta</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <form onSubmit={handleUpdateProfile}>
              <CardHeader>
                <CardTitle>Perfil</CardTitle>
                <CardDescription>Atualize suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" name="name" value={profile.name} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" value={profile.email} disabled />
                  <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categorias Padrão</CardTitle>
              <CardDescription>
                Adicione categorias padrão para facilitar a classificação de suas transações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Ao clicar no botão abaixo, serão adicionadas categorias padrão para receitas e despesas.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSeedCategories} disabled={isSeedingCategories}>
                {isSeedingCategories ? "Adicionando..." : "Adicionar Categorias Padrão"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Configure como deseja receber notificações do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configure notificações por WhatsApp e outras preferências de alertas.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard/settings/notifications">
                <Button>Configurar Notificações</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conta</CardTitle>
              <CardDescription>Gerencie sua conta e sessão</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Ao sair, você será redirecionado para a página de login.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" onClick={handleSignOut}>
                Sair da Conta
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
