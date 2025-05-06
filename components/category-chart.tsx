"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"

// Interface para os dados retornados pelo Supabase
interface TransactionData {
  amount: number
  categories: {
    id: string
    name: string
    color: string
  } | null
}

interface CategoryData {
  id: string
  name: string
  color: string
  amount: number
  percentage: number
}

interface CategoryChartProps {
  type: "income" | "expense"
  startDate: Date
  endDate: Date
}

export function CategoryChart({ type, startDate, endDate }: CategoryChartProps) {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchCategoryData = async () => {
      setIsLoading(true)
      try {
        // Converter datas para formato ISO
        const startDateStr = startDate.toISOString().split("T")[0]
        const endDateStr = endDate.toISOString().split("T")[0]

        // Buscar transações do período agrupadas por categoria
        const { data: transactionsByCategory, error } = await supabase
          .from("transactions")
          .select(`
            amount,
            categories (
              id,
              name,
              color
            )
          `)
          .eq("type", type)
          .gte("date", startDateStr)
          .lte("date", endDateStr)

        if (error) throw error

        // Processar os dados
        const categoryMap = new Map<string, CategoryData>()
        let totalAmount = 0

        // Corrigindo o tipo para evitar o erro
        if (transactionsByCategory) {
          // Convertendo para o tipo correto com uma asserção de tipo
          const transactions = transactionsByCategory as unknown as TransactionData[]

          for (const transaction of transactions) {
            if (!transaction.categories) continue

            const categoryId = transaction.categories.id
            const amount = transaction.amount || 0
            totalAmount += amount

            if (categoryMap.has(categoryId)) {
              const category = categoryMap.get(categoryId)!
              categoryMap.set(categoryId, {
                ...category,
                amount: category.amount + amount,
              })
            } else {
              categoryMap.set(categoryId, {
                id: categoryId,
                name: transaction.categories.name,
                color: transaction.categories.color || "#e2e8f0",
                amount: amount,
                percentage: 0,
              })
            }
          }
        }

        // Calcular percentagens e ordenar por valor
        const categoriesArray = Array.from(categoryMap.values())
          .map((category) => ({
            ...category,
            percentage: totalAmount > 0 ? (category.amount / totalAmount) * 100 : 0,
          }))
          .sort((a, b) => b.amount - a.amount)

        setCategories(categoriesArray)
        setTotal(totalAmount)
      } catch (error) {
        console.error("Erro ao buscar dados de categorias:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategoryData()
  }, [supabase, type, startDate, endDate])

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  if (categories.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <p className="text-muted-foreground">Nenhuma transação encontrada para este período</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-xl font-bold">Total: {formatCurrency(total)}</div>
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                <span>{category.name}</span>
              </div>
              <div className="text-sm font-medium">
                {formatCurrency(category.amount)} ({category.percentage.toFixed(1)}%)
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${category.percentage}%`,
                  backgroundColor: category.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
