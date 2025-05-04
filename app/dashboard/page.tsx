"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, TrendingUp, Wallet } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { RecentTransactions } from "@/components/recent-transactions"
import { MonthlyChart } from "@/components/monthly-chart"
import { PeriodFilter, type PeriodType } from "@/components/period-filter"
import { CategoryChart } from "@/components/category-chart"
import { TrendChart } from "@/components/trend-chart"
import { DashboardWidget } from "@/components/dashboard-widget"
import { FinancialGoals } from "@/components/financial-goals"

interface Account {
  balance: number
}

interface Transaction {
  type: string
  amount: number
}

interface DateRange {
  from: Date
  to: Date
}

export default function DashboardPage() {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [summary, setSummary] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    accountsCount: 0,
  })
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]) // Corrigido para any[]
  const [period, setPeriod] = useState<PeriodType>("month")
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  })

  const handlePeriodChange = (newPeriod: PeriodType, newDateRange?: DateRange) => {
    setPeriod(newPeriod)
    if (newDateRange) {
      setDateRange(newDateRange)
    }
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Buscar saldo total das contas
        const { data: accounts } = await supabase.from("accounts").select("balance")

        const totalBalance = accounts?.reduce((sum: number, account: Account) => sum + account.balance, 0) || 0

        // Contar número de contas
        const accountsCount = accounts?.length || 0

        // Converter datas para formato ISO
        const startDateStr = dateRange.from.toISOString().split("T")[0]
        const endDateStr = dateRange.to.toISOString().split("T")[0]

        // Buscar transações do período selecionado
        const { data: transactions } = await supabase
          .from("transactions")
          .select("*")
          .gte("date", startDateStr)
          .lte("date", endDateStr)
          .order("date", { ascending: false })

        // Calcular receitas e despesas
        const totalIncome =
          transactions
            ?.filter((t: Transaction) => t.type === "income")
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0) || 0

        const totalExpense =
          transactions
            ?.filter((t: Transaction) => t.type === "expense")
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0) || 0

        // Buscar transações recentes
        const { data: recentTransactions } = await supabase
          .from("transactions")
          .select(`
            *,
            accounts(name),
            categories(name, color, icon)
          `)
          .order("date", { ascending: false })
          .limit(5)

        setSummary({
          totalBalance,
          totalIncome,
          totalExpense,
          accountsCount,
        })

        setRecentTransactions(recentTransactions || [])
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase, dateRange])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas finanças pessoais</p>
        </div>
        <PeriodFilter onPeriodChange={handlePeriodChange} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardWidget title="Saldo Total" className="col-span-1">
          <div className="flex items-center">
            <Wallet className="mr-2 h-4 w-4 text-muted-foreground" />
            <div className="text-2xl font-bold">
              {isLoading ? "Carregando..." : formatCurrency(summary.totalBalance)}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Em {summary.accountsCount} conta{summary.accountsCount !== 1 ? "s" : ""}
          </p>
        </DashboardWidget>

        <DashboardWidget
          title="Receitas"
          description={`Período: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`}
          className="col-span-1"
        >
          <div className="flex items-center">
            <ArrowUp className="mr-2 h-4 w-4 text-emerald-500" />
            <div className="text-2xl font-bold text-emerald-500">
              {isLoading ? "Carregando..." : formatCurrency(summary.totalIncome)}
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Despesas"
          description={`Período: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`}
          className="col-span-1"
        >
          <div className="flex items-center">
            <ArrowDown className="mr-2 h-4 w-4 text-rose-500" />
            <div className="text-2xl font-bold text-rose-500">
              {isLoading ? "Carregando..." : formatCurrency(summary.totalExpense)}
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget title="Saldo do Período" className="col-span-1">
          <div className="flex items-center">
            <TrendingUp
              className={`mr-2 h-4 w-4 ${
                summary.totalIncome - summary.totalExpense >= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            />
            <div
              className={`text-2xl font-bold ${
                summary.totalIncome - summary.totalExpense >= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {isLoading ? "Carregando..." : formatCurrency(summary.totalIncome - summary.totalExpense)}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.totalIncome - summary.totalExpense >= 0 ? "Saldo positivo" : "Saldo negativo"}
          </p>
        </DashboardWidget>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Tendência Financeira</CardTitle>
                <CardDescription>Evolução de receitas e despesas ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <TrendChart
                  startDate={dateRange.from}
                  endDate={dateRange.to}
                  interval={period === "year" ? "month" : period === "month" ? "week" : "day"}
                />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
                <CardDescription>Suas últimas 5 transações</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentTransactions transactions={recentTransactions} isLoading={isLoading} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>Suas últimas transações</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentTransactions transactions={recentTransactions} isLoading={isLoading} showViewAll={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Receitas por Categoria</CardTitle>
                <CardDescription>Distribuição de receitas no período selecionado</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryChart type="income" startDate={dateRange.from} endDate={dateRange.to} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
                <CardDescription>Distribuição de despesas no período selecionado</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryChart type="expense" startDate={dateRange.from} endDate={dateRange.to} />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Comparativo Mensal</CardTitle>
              <CardDescription>Comparação mensal entre receitas e despesas</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <MonthlyChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Metas Financeiras</CardTitle>
                <CardDescription>Acompanhe o progresso das suas metas</CardDescription>
              </CardHeader>
              <CardContent>
                <FinancialGoals />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Dicas de Economia</CardTitle>
                <CardDescription>Sugestões para atingir suas metas mais rápido</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-3">
                    <h3 className="font-medium mb-1">Regra 50/30/20</h3>
                    <p className="text-sm text-muted-foreground">
                      Destine 50% da sua renda para necessidades, 30% para desejos e 20% para economias e investimentos.
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <h3 className="font-medium mb-1">Automatize suas economias</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure transferências automáticas para uma conta de poupança no dia do pagamento.
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <h3 className="font-medium mb-1">Revise despesas recorrentes</h3>
                    <p className="text-sm text-muted-foreground">
                      Cancele assinaturas e serviços que você não usa com frequência.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
