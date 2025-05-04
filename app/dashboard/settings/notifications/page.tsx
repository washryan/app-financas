"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { WhatsappConfig } from "@/types/notifications"

export default function NotificationSettingsPage() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsappConfig | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isEnabled, setIsEnabled] = useState(false)
  const [notificationTypes, setNotificationTypes] = useState<string[]>([])

  useEffect(() => {
    const fetchWhatsappConfig = async () => {
      setIsLoading(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new Error("Usuário não autenticado")
        }

        const { data } = await supabase.from("whatsapp_config").select("*").eq("user_id", user.id).single()

        if (data) {
          setWhatsappConfig(data)
          setPhoneNumber(data.phone_number)
          setIsEnabled(data.is_enabled)
          setNotificationTypes(data.notification_types)
        }
      } catch (error) {
        console.error("Erro ao buscar configuração de WhatsApp:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWhatsappConfig()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      // Validar número de telefone
      if (isEnabled && !phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
        throw new Error("Número de telefone inválido. Use o formato internacional: +5511999999999")
      }

      if (whatsappConfig) {
        // Atualizar configuração existente
        await supabase
          .from("whatsapp_config")
          .update({
            phone_number: phoneNumber,
            is_enabled: isEnabled,
            notification_types: notificationTypes,
          })
          .eq("user_id", user.id)
      } else {
        // Criar nova configuração
        await supabase.from("whatsapp_config").insert({
          user_id: user.id,
          phone_number: phoneNumber,
          is_enabled: isEnabled,
          notification_types: notificationTypes,
        })
      }

      toast({
        title: "Configurações de notificação salvas com sucesso!",
      })
    } catch (error: unknown) {
      toast({
        title: "Erro ao salvar configurações",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const notificationTypeOptions = [
    { id: "bill_due", label: "Contas a vencer" },
    { id: "budget_exceeded", label: "Orçamento excedido" },
    { id: "goal_reached", label: "Meta atingida" },
    { id: "general", label: "Notificações gerais" },
  ]

  const toggleNotificationType = (type: string) => {
    setNotificationTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/dashboard/settings" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações de Notificações</h1>
          <p className="text-muted-foreground">Gerencie como você deseja receber notificações</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Notificações por WhatsApp</CardTitle>
            <CardDescription>Configure como deseja receber notificações por WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="whatsapp-enabled">Ativar notificações por WhatsApp</Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações importantes diretamente no seu WhatsApp
                </p>
              </div>
              <Switch id="whatsapp-enabled" checked={isEnabled} onCheckedChange={setIsEnabled} />
            </div>

            {isEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone-number">Número de WhatsApp</Label>
                  <Input
                    id="phone-number"
                    placeholder="+5511999999999"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required={isEnabled}
                  />
                  <p className="text-xs text-muted-foreground">Use o formato internacional: +5511999999999</p>
                </div>

                <div className="space-y-3">
                  <Label>Tipos de notificações</Label>
                  <div className="space-y-2">
                    {notificationTypeOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`notification-type-${option.id}`}
                          checked={notificationTypes.includes(option.id)}
                          onCheckedChange={() => toggleNotificationType(option.id)}
                        />
                        <Label htmlFor={`notification-type-${option.id}`}>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
