"use client"

import { formatCurrency, formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowDown, ArrowUp, CreditCard } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Transaction {
  id: string
  description: string
  amount: number
  type: string
  date: string
  accounts: {
    name: string
  }
  categories: {
    name: string
    color: string
    icon: string
  } | null
}

interface RecentTransactionsProps {
  transactions: Transaction[]
  isLoading: boolean
  showViewAll?: boolean
}

export function RecentTransactions({ transactions, isLoading, showViewAll = false }: RecentTransactionsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Nenhuma transação encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className="rounded-full p-2"
              style={{
                backgroundColor: transaction.categories?.color || "#e2e8f0",
                opacity: 0.8,
              }}
            >
              {transaction.type === "income" ? (
                <ArrowUp className="h-4 w-4 text-white" />
              ) : transaction.type === "expense" ? (
                <ArrowDown className="h-4 w-4 text-white" />
              ) : (
                <CreditCard className="h-4 w-4 text-white" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium leading-none">{transaction.description}</p>
              <p className="text-sm text-muted-foreground">
                {transaction.accounts?.name} • {formatDate(transaction.date)}
              </p>
            </div>
          </div>
          <div
            className={`text-sm font-medium ${
              transaction.type === "income" ? "text-emerald-500" : transaction.type === "expense" ? "text-rose-500" : ""
            }`}
          >
            {transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}
            {formatCurrency(transaction.amount)}
          </div>
        </div>
      ))}

      {showViewAll && (
        <div className="pt-2">
          <Link href="/dashboard/transactions">
            <Button variant="outline" size="sm" className="w-full">
              Ver todas as transações
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
