import { AppToastProvider } from '@/components/ui/toast'
import AppRoutes from '@/routes'

function App() {
  return (
    <AppToastProvider>
      <AppRoutes />
    </AppToastProvider>
  )
}

export default App
