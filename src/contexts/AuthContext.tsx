import { createContext, useContext, useState } from 'react'
import api from '@/lib/api'

interface User {
  id: number
  nome: string
  sobrenome: string
  email: string
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('@sislocacao:user')
    return stored ? (JSON.parse(stored) as User) : null
  })

  const isAuthenticated = !!user

  async function login(email: string, senha: string) {
    const { data } = await api.post<User & { token: string }>('/auth/login', {
      email,
      senha,
    })

    const { token, ...userData } = data

    localStorage.setItem('@sislocacao:token', token)
    localStorage.setItem('@sislocacao:user', JSON.stringify(userData))
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('@sislocacao:token')
    localStorage.removeItem('@sislocacao:user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
