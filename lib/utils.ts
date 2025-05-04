import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("pt-BR").format(date)
}

export const accountTypes = [
  { value: "checking", label: "Conta Corrente" },
  { value: "savings", label: "Conta Poupança" },
  { value: "investment", label: "Investimento" },
  { value: "credit_card", label: "Cartão de Crédito" },
  { value: "cash", label: "Dinheiro" },
  { value: "other", label: "Outro" },
]

export const transactionTypes = [
  { value: "income", label: "Receita" },
  { value: "expense", label: "Despesa" },
  { value: "transfer", label: "Transferência" },
]

export const categoryTypes = [
  { value: "income", label: "Receita" },
  { value: "expense", label: "Despesa" },
]

export const defaultCategories = [
  { name: "Salário", type: "income", color: "#10b981", icon: "Briefcase" },
  { name: "Investimentos", type: "income", color: "#6366f1", icon: "TrendingUp" },
  { name: "Presentes", type: "income", color: "#ec4899", icon: "Gift" },
  { name: "Outros", type: "income", color: "#9ca3af", icon: "Plus" },
  { name: "Alimentação", type: "expense", color: "#f97316", icon: "Utensils" },
  { name: "Transporte", type: "expense", color: "#0ea5e9", icon: "Car" },
  { name: "Moradia", type: "expense", color: "#8b5cf6", icon: "Home" },
  { name: "Saúde", type: "expense", color: "#ef4444", icon: "Heart" },
  { name: "Lazer", type: "expense", color: "#22c55e", icon: "Film" },
  { name: "Educação", type: "expense", color: "#f59e0b", icon: "BookOpen" },
  { name: "Compras", type: "expense", color: "#ec4899", icon: "ShoppingBag" },
  { name: "Contas", type: "expense", color: "#64748b", icon: "FileText" },
]
