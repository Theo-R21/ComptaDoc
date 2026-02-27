"use client"

import {useEffect, useState} from "react"
import {X} from "lucide-react"

type NotificationType = "success" | "error" | "warning" | "info"

interface NotificationProps {
    id?: number
    title: string
    message?: string
    type?: NotificationType
    duration?: number
    onClose?: () => void
}

export default function Notification({
                                         title,
                                         message,
                                         type = "info",
                                         duration = 6500,
                                         onClose,
                                     }: NotificationProps) {
    const [visible, setVisible] = useState(true)
    const [progress, setProgress] = useState(100)
    const handleClose = () => {
        setVisible(false)
        setTimeout(() => {
            onClose?.()
        }, 300)
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => prev - 100 / (duration / 100))
        }, 100)

        const timeout = setTimeout(() => {
            handleClose()
        }, duration)

        return () => {
            clearInterval(interval)
            clearTimeout(timeout)
        }
    }, [])

    if (!visible) return null

    const styles = {
        success: {
            bg: "rgba(76, 175, 80, 0.12)",
            border: "rgba(76, 175, 80, 0.35)",
            accent: "rgba(76, 175, 80, 0.6)",
            text: "#2E7D32",
        },
        error: {
            bg: "rgba(229, 57, 53, 0.10)",
            border: "rgba(229, 57, 53, 0.35)",
            accent: "rgba(229, 57, 53, 0.6)",
            text: "#C62828",
        },
        warning: {
            bg: "rgba(251, 192, 45, 0.15)",
            border: "rgba(251, 192, 45, 0.35)",
            accent: "rgba(251, 192, 45, 0.7)",
            text: "#F57F17",
        },
        info: {
            bg: "rgba(58, 110, 165, 0.12)",
            border: "rgba(58, 110, 165, 0.35)",
            accent: "rgba(58, 110, 165, 0.6)",
            text: "var(--color-primary1)",
        },
    }

    const current = styles[type]

    return (
        <div className="w-[380px] animate-slideIn">
            <div
                className="relative rounded-2xl backdrop-blur-xl shadow-lg border overflow-hidden transition-all duration-300"
                style={{
                    background: current.bg,
                    borderColor: current.border,
                }}
            >
                <div
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at top left, ${current.accent}, transparent 70%)`,
                    }}
                />

                <div className="relative flex items-start justify-between gap-4 px-5 py-4">
                    <div>
                        <h4
                            className="font-semibold text-sm mb-1"
                            style={{color: current.text}}
                        >
                            {title}
                        </h4>
                        {message && (
                            <p className="text-sm text-secondary1/80 leading-relaxed">
                                {message}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleClose}
                        className="text-secondary2 hover:text-secondary1 transition-colors"
                    >
                        <X size={18}/>
                    </button>
                </div>

                <div className="h-[3px] bg-white/20">
                    <div
                        className="h-full transition-all duration-100"
                        style={{
                            width: `${progress}%`,
                            background: current.accent,
                        }}
                    />
                </div>
            </div>
        </div>
    )
}