"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import type { Notification } from "@/types/notifications"

export class NotificationService {
  private supabase = createClientComponentClient<Database>()

  async createNotification(
    notification: Omit<Notification, "id" | "user_id" | "created_at" | "is_read">,
  ): Promise<void> {
    try {
      // Obter ID do usuário
      const {
        data: { user },
      } = await this.supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      // Criar notificação
      await this.supabase.from("notifications").insert({
        user_id: user.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        action_url: notification.action_url,
        related_entity_id: notification.related_entity_id,
        related_entity_type: notification.related_entity_type,
        is_read: false,
      })

      // Verificar se o usuário tem configuração de WhatsApp
      if (notification.type === "warning" || notification.type === "error") {
        await this.sendWhatsAppNotification(user.id, notification)
      }
    } catch (error) {
      console.error("Erro ao criar notificação:", error)
      throw error
    }
  }

  private async sendWhatsAppNotification(
    userId: string,
    notification: Omit<Notification, "id" | "user_id" | "created_at" | "is_read">,
  ): Promise<void> {
    try {
      // Verificar se o usuário tem configuração de WhatsApp
      const { data: whatsappConfig } = await this.supabase
        .from("whatsapp_config")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (!whatsappConfig || !whatsappConfig.is_enabled) {
        return
      }

      // Verificar se o tipo de notificação está habilitado
      let notificationType = "general"

      if (notification.related_entity_type === "transaction" && notification.title.includes("vencimento")) {
        notificationType = "bill_due"
      } else if (notification.related_entity_type === "budget" && notification.title.includes("orçamento")) {
        notificationType = "budget_exceeded"
      } else if (notification.related_entity_type === "goal" && notification.title.includes("meta")) {
        notificationType = "goal_reached"
      }

      if (!whatsappConfig.notification_types.includes(notificationType)) {
        return
      }

      // Em um ambiente de produção, aqui você chamaria uma API para enviar a mensagem WhatsApp
      // Por exemplo, usando a API do Twilio ou WhatsApp Business API
      console.log(`Enviando notificação WhatsApp para ${whatsappConfig.phone_number}:`, {
        title: notification.title,
        message: notification.message,
      })

      // Exemplo de como seria com uma API real:
      /*
      await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: whatsappConfig.phone_number,
          message: `${notification.title}\n\n${notification.message}`
        }),
      })
      */
    } catch (error) {
      console.error("Erro ao enviar notificação WhatsApp:", error)
    }
  }
}

export const notificationService = new NotificationService()
