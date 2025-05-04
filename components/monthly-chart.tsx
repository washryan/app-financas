"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Skeleton } from "@/components/ui/skeleton"

// Removendo a interface não utilizada
// interface MonthData {
//   month: string
//   income: number
//   expense: number
// }

export function MonthlyChart() {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [chartData, setChartData] = useState<{
    labels: string[]
    income: number[]
    expense: number[]
  }>({
    labels: [],
    income: [],
    expense: [],
  })

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true)
      try {
        const now = new Date()
        const currentYear = now.getFullYear()

        // Buscar dados dos últimos 6 meses
        const months: string[] = []
        const incomeData: number[] = []
        const expenseData: number[] = []

        for (let i = 5; i >= 0; i--) {
          const month = new Date(currentYear, now.getMonth() - i, 1)
          const monthName = month.toLocaleString("pt-BR", { month: "short" })
          months.push(monthName)

          const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split("T")[0]
          const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().split("T")[0]

          // Buscar receitas
          const { data: incomeTransactions } = await supabase
            .from("transactions")
            .select("amount")
            .eq("type", "income")
            .gte("date", firstDay)
            .lte("date", lastDay)

          const totalIncome = incomeTransactions?.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0
          incomeData.push(totalIncome)

          // Buscar despesas
          const { data: expenseTransactions } = await supabase
            .from("transactions")
            .select("amount")
            .eq("type", "expense")
            .gte("date", firstDay)
            .lte("date", lastDay)

          const totalExpense =
            expenseTransactions?.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0
          expenseData.push(totalExpense)
        }

        setChartData({
          labels: months,
          income: incomeData,
          expense: expenseData,
        })
      } catch (error) {
        console.error("Erro ao buscar dados do gráfico:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChartData()
  }, [supabase])

  if (isLoading) {
    return <Skeleton className="h-[350px] w-full" />
  }

  const maxValue = Math.max(...chartData.income, ...chartData.expense)

  return (
    <div className="h-[350px] w-full">
      <div className="flex h-full items-end gap-2">
        {chartData.labels.map((month, index) => (
          <div key={month} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full flex justify-center gap-1 h-[300px] items-end">
              <div
                className="w-5 bg-emerald-500 rounded-t"
                style={{
                  height: `${(chartData.income[index] / maxValue) * 100}%`,
                }}
              />
              <div
                className="w-5 bg-rose-500 rounded-t"
                style={{
                  height: `${(chartData.expense[index] / maxValue) * 100}%`,
                }}
              />
            </div>
            <div className="text-xs text-muted-foreground">{month}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-xs text-muted-foreground">Receitas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-rose-500" />
          <span className="text-xs text-muted-foreground">Despesas</span>
        </div>
      </div>
    </div>
  )
}
