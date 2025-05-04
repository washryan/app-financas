"use client"

import type React from "react"
import type { PostgrestError } from "@supabase/supabase-js"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { categoryTypes } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface FormData {
  name: string
  type: string
  color: string
  icon: string
}

export default function NewCategoryPage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    type: "expense",
    color: "#3b82f6",
    icon: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validar campos obrigatórios
      if (!formData.name || !formData.type) {
        throw new Error("Preencha todos os campos obrigatórios")
      }

      // Obter ID do usuário
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      // Criar categoria
      const { error } = await supabase.from("categories").insert({
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        color: formData.color,
        icon: formData.icon || null,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Categoria criada com sucesso!",
        description: "A categoria foi adicionada ao seu perfil.",
      })

      router.push("/dashboard/categories")
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : (error as PostgrestError)?.message || "Ocorreu um erro desconhecido"

      toast({
        title: "Erro ao criar categoria",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/dashboard/categories" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Categoria</h1>
          <p className="text-muted-foreground">Adicione uma nova categoria para suas transações</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Detalhes da Categoria</CardTitle>
            <CardDescription>Preencha os detalhes da sua categoria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Categoria *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ex: Alimentação, Transporte, etc."
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Categoria *</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {categoryTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  name="color"
                  type="color"
                  className="w-12 h-10 p-1"
                  value={formData.color}
                  onChange={handleChange}
                />
                <div className="w-10 h-10 rounded-full" style={{ backgroundColor: formData.color }} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/dashboard/categories">
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Categoria"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
