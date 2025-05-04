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
import { Checkbox } from "@/components/ui/checkbox" 
import { useToast } from "@/hooks/use-toast"
import { accountTypes } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface FormData {
  name: string
  type: string
  balance: string
  is_credit_card: boolean
  credit_limit: string
  color: string
  icon: string
}

export default function NewAccountPage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    type: "checking",
    balance: "",
    is_credit_card: false,
    credit_limit: "",
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

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_credit_card: checked,
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

      // Validar limite de crédito para cartões
      if (formData.is_credit_card && !formData.credit_limit) {
        throw new Error("Informe o limite de crédito para o cartão")
      }

      // Obter ID do usuário
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      // Criar conta
      const { error } = await supabase.from("accounts").insert({
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        balance: Number.parseFloat(formData.balance || "0"),
        is_credit_card: formData.is_credit_card,
        credit_limit: formData.is_credit_card ? Number.parseFloat(formData.credit_limit) : 0,
        color: formData.color,
        icon: formData.icon || null,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "A conta foi adicionada ao seu perfil.",
      })

      router.push("/dashboard/accounts")
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : (error as PostgrestError)?.message || "Ocorreu um erro desconhecido"

      toast({
        title: "Erro ao criar conta",
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
        <Link href="/dashboard/accounts" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Conta</h1>
          <p className="text-muted-foreground">Adicione uma nova conta bancária ou cartão de crédito</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Detalhes da Conta</CardTitle>
            <CardDescription>Preencha os detalhes da sua conta bancária ou cartão</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Conta *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ex: Nubank, Caixa Econômica, etc."
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Conta *</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance">Saldo Inicial</Label>
              <Input
                id="balance"
                name="balance"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.balance}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">Deixe em branco para começar com saldo zero</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_credit_card"
                  checked={formData.is_credit_card}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="is_credit_card">Esta é uma conta de cartão de crédito</Label>
              </div>
            </div>

            {formData.is_credit_card && (
              <div className="space-y-2">
                <Label htmlFor="credit_limit">Limite de Crédito *</Label>
                <Input
                  id="credit_limit"
                  name="credit_limit"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.credit_limit}
                  onChange={handleChange}
                  required={formData.is_credit_card}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="color">Cor (opcional)</Label>
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
            <Link href="/dashboard/accounts">
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Conta"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
