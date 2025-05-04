"use client"

import type { PostgrestError } from "@supabase/supabase-js"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowDown, ArrowUp, CreditCard, Plus, Search } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

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

interface Account {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
  type: string
}

interface Filters {
  search: string
  type: string
  account: string
  category: string
}

export default function TransactionsPage() {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: "",
    account: "",
    category: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Buscar transações
        let query = supabase
          .from("transactions")
          .select(`
            *,
            accounts(id, name),
            categories(id, name, color, icon)
          `)
          .order("date", { ascending: false })

        // Aplicar filtros
        if (filters.search) {
          query = query.ilike("description", `%${filters.search}%`)
        }

        if (filters.type) {
          query = query.eq("type", filters.type)
        }

        if (filters.account) {
          query = query.eq("account_id", filters.account)
        }

        if (filters.category) {
          query = query.eq("category_id", filters.category)
        }

        const { data: transactions, error: transactionsError } = await query

        if (transactionsError) {
          throw transactionsError
        }

        // Buscar contas
        const { data: accounts, error: accountsError } = await supabase
          .from("accounts")
          .select("id, name")
          .order("name")

        if (accountsError) {
          throw accountsError
        }

        // Buscar categorias
        const { data: categories, error: categoriesError } = await supabase
          .from("categories")
          .select("id, name, type")
          .order("name")

        if (categoriesError) {
          throw categoriesError
        }

        setTransactions(transactions || [])
        setAccounts(accounts || [])
        setCategories(categories || [])
      } catch (error: unknown) {
        console.error(
          "Erro ao buscar transações:",
          error instanceof Error ? error.message : (error as PostgrestError)?.message,
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase, filters])

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">Gerencie suas transações financeiras</p>
        </div>
        <Link href="/dashboard/transactions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre suas transações por diferentes critérios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar descrição..."
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="transfer">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Conta</label>
              <Select value={filters.account} onValueChange={(value) => handleFilterChange("account", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as contas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as contas</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
          <CardDescription>Lista de todas as suas transações</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Nenhuma transação encontrada</p>
              <Link href="/dashboard/transactions/new">
                <Button variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Transação
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div
                          className="mr-2 rounded-full p-1.5"
                          style={{
                            backgroundColor: transaction.categories?.color || "#e2e8f0",
                            opacity: 0.8,
                          }}
                        >
                          {transaction.type === "income" ? (
                            <ArrowUp className="h-3 w-3 text-white" />
                          ) : transaction.type === "expense" ? (
                            <ArrowDown className="h-3 w-3 text-white" />
                          ) : (
                            <CreditCard className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <Link href={`/dashboard/transactions/${transaction.id}`} className="hover:underline">
                          {transaction.description}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>{transaction.categories?.name || "-"}</TableCell>
                    <TableCell>{transaction.accounts?.name}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        transaction.type === "income"
                          ? "text-emerald-500"
                          : transaction.type === "expense"
                            ? "text-rose-500"
                            : ""
                      }`}
                    >
                      {transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
