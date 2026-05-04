import {
  Building2,
  ChevronsUpDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Receipt,
  User,
  UserCheck,
  UserCog,
  Users,
  X,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: 'Cadastros',
    items: [
      { label: 'Inquilinos', href: '/cadastros/inquilinos', icon: Users },
      { label: 'Imóveis',    href: '/cadastros/imoveis',    icon: Building2 },
      { label: 'Locador',    href: '/cadastros/locador',    icon: UserCheck },
      { label: 'Usuários',   href: '/cadastros/usuarios',   icon: UserCog },
    ],
  },
  {
    title: 'Locação',
    items: [
      { label: 'Gerar Locação', href: '/locacao/gerar',    icon: ClipboardList },
      { label: 'Gerar Recibos', href: '/locacao/recibos',  icon: Receipt },
    ],
  },
]

interface AppSidebarProps {
  open: boolean
  onClose: () => void
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const initials = user
    ? `${user.nome[0]}${user.sobrenome[0]}`.toUpperCase()
    : 'AD'

  const fullName = user ? `${user.nome} ${user.sobrenome}` : 'Usuário'

  function handleProfile() {
    navigate('/perfil')
    onClose()
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-200',
        'md:relative md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      {/* Brand */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary">
            <LayoutDashboard className="size-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-sidebar-foreground">SisLocação</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:hidden"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {navGroups.map((group, i) => (
          <div key={group.title} className={cn('space-y-0.5', i > 0 && 'mt-6')}>
            <p className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {group.title}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                  )
                }
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User dropdown */}
      <div className="shrink-0 border-t border-sidebar-border p-2">
        <DropdownMenuRoot>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-foreground group-hover:text-sidebar-accent-foreground">
                  {fullName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleProfile}>
              <User />
              Ver perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut />
              Fazer logoff
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuRoot>
      </div>
    </aside>
  )
}
