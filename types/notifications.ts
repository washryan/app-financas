export interface Notification {
    id: string
    user_id: string
    title: string
    message: string
    type: "info" | "warning" | "success" | "error"
    is_read: boolean
    created_at: string
    action_url?: string
    related_entity_id?: string
    related_entity_type?: string
  }
  
  export interface WhatsappConfig {
    user_id: string
    phone_number: string
    is_enabled: boolean
    notification_types: string[]
    created_at: string
    updated_at: string
  }
  