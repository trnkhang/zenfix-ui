import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = (props: ToasterProps) => (
  <Sonner
    richColors
    position="top-right"
    toastOptions={{
      style: {
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        fontSize: '0.875rem',
      },
    }}
    {...props}
  />
)

export { Toaster }
