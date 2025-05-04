"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Goal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  end_date: string
}

export function FinancialGoals() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [goals, setGoals] = useState<Goal[]>([])
  const [open, setOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({
    name: "",
    target_amount: "",
    end_date: "",
  })

  useEffect(() => {
    const fetchGoals = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("financial_goals").select("*").order("end_date")

        if (error) throw error
        setGoals(data || [])
      } catch (error) {
        console.error("Erro ao buscar metas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGoals()
  }, [supabase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewGoal((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Obter ID do usuário
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      const { error } = await supabase.from("financial_goals").insert({
        user_id: user.id,
        name: newGoal.name,
        target_amount: Number.parseFloat(newGoal.target_amount),
        current_amount: 0,
        end_date: newGoal.end_date,
      })

      if (error) throw error

      toast({
        title: "Meta criada com sucesso!",
      })

      // Recarregar metas
      const { data } = await supabase.from("financial_goals").select("*").order("end_date")

      setGoals(data || [])

      // Resetar formulário
      setNewGoal({
        name: "",
        target_amount: "",
        end_date: "",
      })

      setOpen(false)
    } catch (error: unknown) {
      toast({
        title: "Erro ao criar meta",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full" />
  }

  return (
    <div className="space-y-4">
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6">
          <p className="text-muted-foreground mb-4">Você ainda não tem metas financeiras</p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar Meta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Nova Meta Financeira</DialogTitle>
                  <DialogDescription>
                    Defina uma meta para economizar dinheiro para um objetivo específico.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome da Meta</Label>
                    <Input id="name" name="name" value={newGoal.name} onChange={handleInputChange} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="target_amount">Valor Alvo</Label>
                    <Input
                      id="target_amount"
                      name="target_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newGoal.target_amount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end_date">Data Limite</Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="date"
                      value={newGoal.end_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Suas Metas</h3>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nova Meta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Nova Meta Financeira</DialogTitle>
                    <DialogDescription>
                      Defina uma meta para economizar dinheiro para um objetivo específico.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nome da Meta</Label>
                      <Input id="name" name="name" value={newGoal.name} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="target_amount">Valor Alvo</Label>
                      <Input
                        id="target_amount"
                        name="target_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newGoal.target_amount}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end_date">Data Limite</Label>
                      <Input
                        id="end_date"
                        name="end_date"
                        type="date"
                        value={newGoal.end_date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Salvar</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {goals.map((goal) => {
              const progress = (goal.current_amount / goal.target_amount) * 100
              const endDate = new Date(goal.end_date)
              const daysLeft = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

              return (
                <div key={goal.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{goal.name}</span>
                    <span className="font-medium">
                      {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress.toFixed(0)}% concluído</span>
                    <span>{daysLeft > 0 ? `${daysLeft} dias restantes` : "Prazo vencido"}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
