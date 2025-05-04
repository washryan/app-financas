"use client"

import type React from "react"
import type { PostgrestError } from "@supabase/supabase-js"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { transactionTypes } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Account {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
  type: string
}

interface FormData {
  description: string
  amount: string
  type: string
  date: string
  account_id: string
  category_id: string
  is_paid: boolean
  notes: string
}

export default function NewTransactionPage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<FormData>({
    description: "",
    amount: "",
    type: "expense",
    date: new Date().toISOString().split("T")[0],
    account_id: "",
    category_id: "",
    is_paid: true,
    notes: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar contas
        const { data: accounts } = await supabase.from("accounts").select("id, name").order("name")

        setAccounts(accounts || [])

        // Definir conta padrão se houver apenas uma
        if (accounts?.length === 1) {
          setFormData((prev) => ({
            ...prev,
            account_id: accounts[0].id,
          }))
        }

        // Buscar categorias
        const { data: categories } = await supabase.from("categories").select("id, name, type").order("name")

        setCategories(categories || [])
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
      }
    }

    fetchData()
  }, [supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      is_paid: checked,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validar campos obrigatórios
      if (!formData.description || !formData.amount || !formData.date || !formData.account_id) {
        throw new Error("Preencha todos os campos obrigatórios")
      }

      // Obter ID do usuário
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      // Criar transação
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        description: formData.description,
        amount: Number.parseFloat(formData.amount),
        type: formData.type,
        date: formData.date,
        account_id: formData.account_id,
        category_id: formData.category_id || null,
        is_paid: formData.is_paid,
        notes: formData.notes || null,
      })

      if (error) {
        throw error
      }

      // Atualizar saldo da conta se a transação estiver paga
      if (formData.is_paid) {
        const { data: account } = await supabase
          .from("accounts")
          .select("balance")
          .eq("id", formData.account_id)
          .single()

        if (account) {
          let newBalance = account.balance

          if (formData.type === "income") {
            newBalance += Number.parseFloat(formData.amount)
          } else if (formData.type === "expense") {
            newBalance -= Number.parseFloat(formData.amount)
          }

          await supabase.from("accounts").update({ balance: newBalance }).eq("id", formData.account_id)
        }
      }

      toast({
        title: "Transação criada com sucesso!",
        description: "A transação foi adicionada ao seu histórico.",
      })

      router.push("/dashboard/transactions")
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : (error as PostgrestError)?.message || "Ocorreu um erro desconhecido"

      toast({
        title: "Erro ao criar transação",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar categorias com base no tipo de transação
  const filteredCategories = categories.filter((category) => category.type === formData.type)

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/dashboard/transactions" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Transação</h1>
          <p className="text-muted-foreground">Adicione uma nova transação ao seu histórico financeiro</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Detalhes da Transação</CardTitle>
            <CardDescription>Preencha os detalhes da sua transação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Ex: Compra no supermercado"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor *</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="account">Conta *</Label>
                <Select value={formData.account_id} onValueChange={(value) => handleSelectChange("account_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleSelectChange("category_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem categoria</SelectItem>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="is_paid" checked={formData.is_paid} onCheckedChange={handleCheckboxChange} />
                <Label htmlFor="is_paid">Transação já paga/recebida</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Se marcado, o saldo da conta será atualizado automaticamente
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Observações adicionais sobre a transação"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/dashboard/transactions">
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Transação"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
