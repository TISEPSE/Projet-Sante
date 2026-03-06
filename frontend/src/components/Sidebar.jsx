import { NavLink, useNavigate } from 'react-router-dom'

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate()

  return (
    <aside className="w-64 flex-shrink-0 bg-panel-dark border-r border-border-dark flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="flex flex-col h-full">
        {/* Branding */}
        <div className="h-16 flex items-center px-6 border-b border-border-dark">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
              SC
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-100 leading-tight">Santé&amp;Cie</span>
              <span className="text-xs text-slate-400">OT Manager</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors border-l-2 ${
                isActive
                  ? 'text-slate-100 bg-primary/10 border-primary'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-surface-lighter border-transparent'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">list</span>
            Liste des OT
          </NavLink>

          <NavLink
            to="/parametres"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors border-l-2 ${
                isActive
                  ? 'text-slate-100 bg-primary/10 border-primary'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-surface-lighter border-transparent'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            Paramètres
          </NavLink>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-border-dark">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              {user.prenom[0]}{user.nom[0]}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-slate-200 truncate">{user.prenom} {user.nom}</span>
              <span className="text-xs text-slate-500 truncate">{user.email}</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded bg-border-dark hover:bg-white/10 text-xs font-medium text-slate-300 h-8 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  )
}
