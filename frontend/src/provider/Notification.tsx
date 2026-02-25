"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import Notification from "@/src/app/components/notication";

type NotificationType = "success" | "error" | "warning" | "info"

interface NotificationItem {
  id: number
  title: string
  message?: string
  type?: NotificationType
}

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationItem, "id">) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const showNotification = (notification: Omit<NotificationItem, "id">) => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { ...notification, id }])
  }

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      <div className="fixed top-6 right-6 z-50 flex flex-col gap-4">
        {notifications.map((notif) => (
          <Notification
            key={notif.id}
            {...notif}
            onClose={() => removeNotification(notif.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used inside NotificationProvider")
  }
  return context
}