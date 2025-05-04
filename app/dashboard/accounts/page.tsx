"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

interface Account {
  id: string
  name: string
  type: string
  balance: number
  is_credit_card: boolean
  credit_limit: number
  color: string | null
  icon: string | null
}

export default function AccountsPage() {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [totalBalance, setTotalBalance] = useState(0)

  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoading(true)
      try {
        const { data } = await supabase.from("accounts").select("*").order("name")

        setAccounts(data || [])

        // Calcular saldo total
        const total = data?.reduce((sum: number, account: Account) => sum + account.balance, 0) || 0
        setTotalBalance(total)
      } catch (error) {
        console.error("Erro ao buscar contas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccounts()
  }, [supabase])

  const getAccountTypeLabel = (type: string): string => {
    const types: Record<string, string> = {
      checking: "Conta Corrente",
      savings: "Conta Poupança",
      investment: "Investimento",
      credit_card: "Cartão de Crédito",
      cash: "Dinheiro",
      other: "Outro",
    }
    return types[type] || type
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contas</h1>
          <p className="text-muted-foreground">Gerencie suas contas bancárias e cartões</p>
        </div>
        <Link href="/dashboard/accounts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Conta
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
          <CardDescription>Visão geral de todas as suas contas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "Carregando..." : formatCurrency(totalBalance)}</div>
          <p className="text-sm text-muted-foreground">
            Saldo total em {accounts.length} conta{accounts.length !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[180px] w-full" />)
        ) : accounts.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">Você ainda não tem nenhuma conta cadastrada</p>
              <Link href="/dashboard/accounts/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Conta
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          accounts.map((account) => (
            <Link key={account.id} href={`/dashboard/accounts/${account.id}`}>
              <Card className="h-full cursor-pointer transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span>{account.name}</span>
                    {account.is_credit_card && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        Cartão de Crédito
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{getAccountTypeLabel(account.type)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
                  {account.is_credit_card && (
                    <p className="text-sm text-muted-foreground">Limite: {formatCurrency(account.credit_limit)}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
