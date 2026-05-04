import { Menu, Moon, Sun } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '@/contexts/ThemeContext'

const routeMeta: Record<string, { section: string; title: string }> = {
  '/cadastros/inquilinos': { section: 'Cadastros', title: 'Inquilinos' },
  '/cadastros/imoveis':    { section: 'Cadastros', title: 'Imóveis' },
  '/cadastros/locador':    { section: 'Cadastros', title: 'Locador' },
  '/cadastros/usuarios':   { section: 'Cadastros', title: 'Usuários' },
  '/locacao/gerar':        { section: 'Locação',   title: 'Gerar Locação' },
  '/locacao/recibos':      { section: 'Locação',   title: 'Gerar Recibos' },
}

interface AppHeaderProps {
  onMenuClick: () => void
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { pathname } = useLocation()
  const { theme, toggleTheme } = useTheme()
  const meta = routeMeta[pathname]

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 md:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Breadcrumb */}
      <div className="flex-1">
        {meta ? (
          <nav className="flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">{meta.section}</span>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-foreground">{meta.title}</span>
          </nav>
        ) : (
          <span className="text-sm font-medium text-foreground">Dashboard</span>
        )}
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
      >
        {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
    </header>
  )
}
