import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message: string
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

function ToastItem({ toast, onClose }: ToastProps) {
  const Icon = toastIcons[toast.type]
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [toast.id, onClose])

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`relative backdrop-blur-xl border-2 rounded-2xl p-4 shadow-2xl max-w-sm w-full ${toastStyles[toast.type]}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm mb-1">{toast.title}</h4>
          <p className="text-sm opacity-90">{toast.message}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onClose(toast.id)}
          className="flex-shrink-0 w-6 h-6 rounded-lg hover:bg-black/10 flex items-center justify-center transition-colors"
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}

let toasts: Toast[] = []
let setToastsFunction: React.Dispatch<React.SetStateAction<Toast[]>> | null = null

export function ToastContainer() {
  const [toastList, setToastList] = useState<Toast[]>([])
  
  useEffect(() => {
    setToastsFunction = setToastList
    setToastList(toasts)
  }, [])

  const removeToast = (id: string) => {
    toasts = toasts.filter(toast => toast.id !== id)
    setToastList([...toasts])
  }

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3">
      <AnimatePresence>
        {toastList.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

export function showToast({ type, title, message }: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substr(2, 9)
  const newToast: Toast = { id, type, title, message }
  
  toasts.push(newToast)
  if (setToastsFunction) {
    setToastsFunction([...toasts])
  }
} 