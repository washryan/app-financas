"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

interface Category {
  id: string
  name: string
  type: string
  color: string | null
  icon: string | null
}

export default function CategoriesPage() {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      try {
        const { data } = await supabase.from("categories").select("*").order("name")

        setCategories(data || [])
      } catch (error) {
        console.error("Erro ao buscar categorias:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [supabase])

  // Separar categorias por tipo
  const incomeCategories = categories.filter((cat) => cat.type === "income")
  const expenseCategories = categories.filter((cat) => cat.type === "expense")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">Gerencie as categorias para suas transações</p>
        </div>
        <Link href="/dashboard/categories/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="expense" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expense">Despesas</TabsTrigger>
          <TabsTrigger value="income">Receitas</TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categorias de Despesas</CardTitle>
              <CardDescription>Categorias para classificar suas despesas</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : expenseCategories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Você ainda não tem categorias de despesas</p>
                  <Link href="/dashboard/categories/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Categoria
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {expenseCategories.map((category) => (
                    <Link key={category.id} href={`/dashboard/categories/${category.id}`}>
                      <Card className="h-full cursor-pointer transition-all hover:shadow-md">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                            style={{ backgroundColor: category.color || "#e2e8f0" }}
                          >
                            <span className="text-white text-xs">{category.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <p className="font-medium">{category.name}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categorias de Receitas</CardTitle>
              <CardDescription>Categorias para classificar suas receitas</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : incomeCategories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Você ainda não tem categorias de receitas</p>
                  <Link href="/dashboard/categories/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Categoria
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {incomeCategories.map((category) => (
                    <Link key={category.id} href={`/dashboard/categories/${category.id}`}>
                      <Card className="h-full cursor-pointer transition-all hover:shadow-md">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                            style={{ backgroundColor: category.color || "#e2e8f0" }}
                          >
                            <span className="text-white text-xs">{category.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <p className="font-medium">{category.name}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
