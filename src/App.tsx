import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import AppLayout from '@/layouts/AppLayout'
import LoginPage from '@/pages/auth/LoginPage'
import InquilinosPage from '@/pages/cadastros/inquilinos/InquilinosPage'
import ImoveisPage from '@/pages/cadastros/ImoveisPage'
import LocadoresPage from '@/pages/cadastros/locadores/LocadoresPage'
import UsuariosPage from '@/pages/cadastros/UsuariosPage'
import GerarLocacaoPage from '@/pages/locacao/GerarLocacaoPage'
import GerarRecibosPage from '@/pages/locacao/GerarRecibosPage'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Rota pública */}
              <Route path="/login" element={<LoginPage />} />

              {/* Rotas protegidas */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Navigate to="/cadastros/inquilinos" replace />} />

                  <Route path="cadastros/inquilinos" element={<InquilinosPage />} />
                  <Route path="cadastros/imoveis"    element={<ImoveisPage />} />
                  <Route path="cadastros/locador"    element={<LocadoresPage />} />
                  <Route path="cadastros/usuarios"   element={<UsuariosPage />} />

                  <Route path="locacao/gerar"        element={<GerarLocacaoPage />} />
                  <Route path="locacao/recibos"      element={<GerarRecibosPage />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
