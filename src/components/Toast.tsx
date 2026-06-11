import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { RiCheckLine, RiCloseCircleLine, RiCloseLine } from 'react-icons/ri'

type ToastVariant = 'success' | 'error'

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  success: (message: string) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const VARIANTS = {
  success: {
    bar: 'bg-emerald-500',
    icon: <RiCheckLine className="text-emerald-500" />,
    text: 'text-zinc-800',
  },
  error: {
    bar: 'bg-red-500',
    icon: <RiCloseCircleLine className="text-red-500" />,
    text: 'text-zinc-800',
  },
}

let _id = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) { clearTimeout(timer); timers.current.delete(id) }
  }, [])

  const add = useCallback((message: string, variant: ToastVariant) => {
    const id = ++_id
    setToasts((prev) => [...prev, { id, message, variant }])
    const timer = setTimeout(() => dismiss(id), 3500)
    timers.current.set(id, timer)
  }, [dismiss])

  useEffect(() => {
    const map = timers.current
    return () => { map.forEach(clearTimeout) }
  }, [])

  const value: ToastContextValue = {
    success: (msg) => add(msg, 'success'),
    error: (msg) => add(msg, 'error'),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex flex-col gap-2">
          {toasts.map((t) => {
            const v = VARIANTS[t.variant]
            return (
              <div
                key={t.id}
                className="pointer-events-auto flex w-80 items-start gap-3 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg"
              >
                <div className={`w-1 shrink-0 self-stretch ${v.bar}`} />
                <div className="flex flex-1 items-center gap-2 py-3 pr-1">
                  <span className="text-base">{v.icon}</span>
                  <p className={`flex-1 text-sm ${v.text}`}>{t.message}</p>
                  <button
                    onClick={() => dismiss(t.id)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-zinc-400 hover:text-zinc-600"
                  >
                    <RiCloseLine />
                  </button>
                </div>
              </div>
            )
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
