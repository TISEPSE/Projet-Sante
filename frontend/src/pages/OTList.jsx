import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'

const AVATAR_COLORS = [
  'bg-indigo-900/60 text-indigo-300 border-indigo-700/40',
  'bg-purple-900/60 text-purple-300 border-purple-700/40',
  'bg-teal-900/60 text-teal-300 border-teal-700/40',
  'bg-blue-900/60 text-blue-300 border-blue-700/40',
  'bg-rose-900/60 text-rose-300 border-rose-700/40',
  'bg-amber-900/60 text-amber-300 border-amber-700/40',
  'bg-emerald-900/60 text-emerald-300 border-emerald-700/40',
]

function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return {
    date: d.toLocaleDateString('fr-FR'),
    time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  }
}

export default function OTList({ ots }) {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const filtered = ots.filter((ot) => {
    const q = search.toLowerCase()
    return (
      ot.numero_ot.toLowerCase().includes(q) ||
      ot.numero_demande.toLowerCase().includes(q) ||
      ot.titulaire.toLowerCase().includes(q) ||
      ot.demandeur.toLowerCase().includes(q) ||
      ot.intitule.toLowerCase().includes(q)
    )
  })

  const total = ots.length
  const pending = ots.filter((o) => !o.mep_effectuee).length
  const done = ots.filter((o) => o.mep_effectuee).length

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-bg-dark">
      {/* Header */}
      <header className="h-16 bg-bg-dark border-b border-border-dark flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-slate-100">Ordres de Transport</h1>
          <div className="h-4 w-px bg-border-dark mx-1" />
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total</span>
              <span className="text-2xl font-black font-mono text-slate-100">{total}</span>
            </div>
            <div className="h-8 w-px bg-border-dark" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">En attente</span>
              <span className="text-2xl font-black font-mono text-primary">{pending}</span>
            </div>
            <div className="h-8 w-px bg-border-dark" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">MEP faite</span>
              <span className="text-2xl font-black font-mono text-green-400">{done}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-500 text-[18px]">search</span>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher OT, demande, titulaire..."
              className="block w-72 pl-10 pr-3 py-1.5 border border-border-dark rounded bg-panel-dark text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all"
            />
          </div>
          <button
            onClick={() => navigate('/ot/new')}
            className="flex items-center justify-center gap-2 px-4 py-1.5 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Créer un OT
          </button>
        </div>
      </header>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-panel-dark border border-border-dark rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-lighter border-b border-border-dark text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">N° OT</th>
                  <th className="px-4 py-3 w-1/3">Intitulé</th>
                  <th className="px-4 py-3">Titulaire</th>
                  <th className="px-4 py-3">N° Demande</th>
                  <th className="px-4 py-3">Lot</th>
                  <th className="px-4 py-3">Date souhaitée</th>
                  <th className="px-4 py-3">Statut MEP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <span className="material-symbols-outlined text-4xl text-slate-600 block mb-2">search_off</span>
                      <span className="text-slate-500 text-sm">Aucun ordre de transport trouvé</span>
                    </td>
                  </tr>
                ) : (
                  filtered.map((ot) => {
                    const { date, time } = formatDate(ot.date_souhaitee)
                    const avatarColor = getAvatarColor(ot.titulaire)
                    return (
                      <tr
                        key={ot.id}
                        onClick={() => navigate(`/ot/${ot.id}`)}
                        className={`hover:bg-surface-lighter/60 transition-colors cursor-pointer ${
                          ot.mep_effectuee ? 'bg-green-500/[0.04]' : ''
                        }`}
                      >
                        {/* N° OT — souligné uniquement au hover de la cellule */}
                        <td className="px-4 py-3">
                          <span className="font-mono text-primary hover:underline">
                            {ot.numero_ot}
                          </span>
                        </td>

                        {/* Intitulé */}
                        <td className="px-4 py-3 text-slate-300 max-w-xs">
                          <span className="truncate block max-w-xs">{ot.intitule}</span>
                        </td>

                        {/* Titulaire avec avatar coloré */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${avatarColor}`}>
                              {getInitials(ot.titulaire)}
                            </div>
                            <span className="text-slate-300">{ot.titulaire}</span>
                          </div>
                        </td>

                        {/* N° Demande */}
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs bg-slate-800 text-slate-300 border border-border-dark px-2 py-0.5 rounded">
                            {ot.numero_demande}
                          </span>
                        </td>

                        {/* Lot */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                            <span className="material-symbols-outlined text-[12px]">package_2</span>
                            Lot {ot.lot_transport}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-slate-300 text-xs font-medium">{date}</span>
                            <span className="text-slate-500 text-[11px]">{time}</span>
                          </div>
                        </td>

                        {/* Statut */}
                        <td className="px-4 py-3">
                          <StatusBadge mepEffectuee={ot.mep_effectuee} />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-panel-dark border-t border-border-dark px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              <span className="text-slate-300 font-medium">{filtered.length}</span> résultat(s) sur{' '}
              <span className="text-slate-300 font-medium">{total}</span>
            </span>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400/60" />
                MEP effectuée
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                En attente
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
