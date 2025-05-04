"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Skeleton } from "@/components/ui/skeleton"
import {
  addDays,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isSameDay,
  isSameMonth,
} from "date-fns"
import { ptBR } from "date-fns/locale"

interface Transaction {
  date: string
  amount: number
  type: string
}

interface TrendData {
  date: Date
  income: number
  expense: number
  balance: number
}

interface TrendChartProps {
  startDate: Date
  endDate: Date
  interval: "day" | "week" | "month"
}

export function TrendChart({ startDate, endDate, interval }: TrendChartProps) {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [trendData, setTrendData] = useState<TrendData[]>([])

  useEffect(() => {
    const fetchTrendData = async () => {
      setIsLoading(true)
      try {
        // Converter datas para formato ISO
        const startDateStr = startDate.toISOString().split("T")[0]
        const endDateStr = endDate.toISOString().split("T")[0]

        // Buscar todas as transações do período
        const { data: transactions, error } = await supabase
          .from("transactions")
          .select("date, amount, type")
          .gte("date", startDateStr)
          .lte("date", endDateStr)
          .order("date")

        if (error) throw error

        // Criar intervalos baseados no parâmetro interval
        let intervals: Date[] = []

        if (interval === "day") {
          intervals = eachDayOfInterval({ start: startDate, end: endDate })
        } else if (interval === "week") {
          intervals = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 })
        } else if (interval === "month") {
          intervals = eachMonthOfInterval({ start: startDate, end: endDate })
        }

        // Inicializar dados de tendência
        const trend: TrendData[] = intervals.map((date) => ({
          date,
          income: 0,
          expense: 0,
          balance: 0,
        }))

        // Processar transações
        transactions?.forEach((transaction: Transaction) => {
          const transactionDate = new Date(transaction.date)
          const amount = transaction.amount || 0

          // Encontrar o intervalo correto para esta transação
          let intervalIndex = -1

          if (interval === "day") {
            intervalIndex = trend.findIndex((item) => isSameDay(item.date, transactionDate))
          } else if (interval === "week") {
            // Encontrar a semana que contém esta data
            intervalIndex = trend.findIndex((item, index) => {
              const nextWeekStart = index < trend.length - 1 ? trend[index + 1].date : addDays(item.date, 7)
              return transactionDate >= item.date && transactionDate < nextWeekStart
            })
          } else if (interval === "month") {
            intervalIndex = trend.findIndex((item) => isSameMonth(item.date, transactionDate))
          }

          if (intervalIndex !== -1) {
            if (transaction.type === "income") {
              trend[intervalIndex].income += amount
            } else if (transaction.type === "expense") {
              trend[intervalIndex].expense += amount
            }

            // Atualizar saldo
            trend[intervalIndex].balance = trend[intervalIndex].income - trend[intervalIndex].expense
          }
        })

        setTrendData(trend)
      } catch (error) {
        console.error("Erro ao buscar dados de tendência:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendData()
  }, [supabase, startDate, endDate, interval])

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  if (trendData.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <p className="text-muted-foreground">Nenhum dado disponível para este período</p>
      </div>
    )
  }

  // Encontrar valores máximos para escala
  const maxIncome = Math.max(...trendData.map((d) => d.income))
  const maxExpense = Math.max(...trendData.map((d) => d.expense))
  const maxBalance = Math.max(...trendData.map((d) => Math.abs(d.balance)))
  const maxValue = Math.max(maxIncome, maxExpense, maxBalance)

  // Formatar rótulos de data
  const formatLabel = (date: Date) => {
    if (interval === "day") {
      return format(date, "dd/MM")
    } else if (interval === "week") {
      return `${format(date, "dd/MM")}`
    } else {
      return format(date, "MMM/yy", { locale: ptBR })
    }
  }

  return (
    <div className="h-[300px] w-full">
      <div className="flex h-[250px] items-end gap-1">
        {trendData.map((data, index) => (
          <div key={index} className="flex flex-1 flex-col items-center">
            <div className="relative h-full w-full">
              {/* Linha de saldo */}
              <div
                className={`absolute bottom-0 left-1/2 h-1 w-4 -translate-x-1/2 ${data.balance >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                style={{
                  bottom: `${(Math.abs(data.balance) / maxValue) * 100}%`,
                }}
              />

              {/* Barra de receita */}
              <div
                className="absolute bottom-0 left-0 w-2 bg-emerald-500"
                style={{
                  height: `${(data.income / maxValue) * 100}%`,
                }}
              />

              {/* Barra de despesa */}
              <div
                className="absolute bottom-0 right-0 w-2 bg-rose-500"
                style={{
                  height: `${(data.expense / maxValue) * 100}%`,
                }}
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{formatLabel(data.date)}</div>
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
        <div className="flex items-center gap-2">
          <div className="h-1 w-4 bg-emerald-500" />
          <span className="text-xs text-muted-foreground">Saldo</span>
        </div>
      </div>
    </div>
  )
}
