import { useState, useEffect } from 'react'
import { fetchUsers } from '../services/api'

const ROLE_LABEL = { responsable: 'Responsable', developpeur: 'Développeur' }
const ROLE_STYLE = {
  responsable: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  developpeur: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
}

function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border ${ROLE_STYLE[role] || 'bg-slate-500/15 text-slate-400 border-slate-500/30'}`}>
      <span className="material-symbols-outlined text-[12px]">
        {role === 'responsable' ? 'manage_accounts' : 'code'}
      </span>
      {ROLE_LABEL[role] || role}
    </span>
  )
}

function Section({ icon, iconClass = 'text-primary', title, children }) {
  return (
    <div className="bg-panel-dark border border-border-dark rounded-lg overflow-hidden">
      <div className="px-5 py-3 border-b border-border-dark flex items-center gap-2 bg-surface-lighter/30">
        <span className={`material-symbols-outlined text-[16px] ${iconClass}`}>{icon}</span>
        <span className="text-sm font-semibold text-slate-200">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function Settings({ currentUser }) {
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .finally(() => setLoadingUsers(false))
  }, [])

  const responsables = users.filter((u) => u.role === 'responsable')
  const developpeurs = users.filter((u) => u.role === 'developpeur')

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-bg-dark">
      {/* Header */}
      <header className="h-16 bg-bg-dark border-b border-border-dark flex items-center px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-slate-400 text-[20px]">settings</span>
          <h1 className="text-lg font-semibold text-slate-100">Paramètres</h1>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">

          {/* Mon profil */}
          <Section icon="person" title="Mon profil">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xl">
                {currentUser.prenom[0]}{currentUser.nom[0]}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-white font-semibold text-lg">{currentUser.prenom} {currentUser.nom}</span>
                <span className="text-slate-400 text-sm">{currentUser.email}</span>
                <RoleBadge role={currentUser.role} />
              </div>
            </div>
          </Section>

          {/* Membres de l'équipe */}
          <Section icon="group" iconClass="text-teal-400" title="Membres de l'équipe">
            {loadingUsers ? (
              <p className="text-slate-500 text-sm">Chargement...</p>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Responsables */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-purple-400">manage_accounts</span>
                    Responsables ({responsables.length})
                  </h3>
                  {responsables.length === 0 ? (
                    <p className="text-slate-600 text-sm italic">Aucun responsable enregistré.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {responsables.map((u) => (
                        <div key={u.id} className="flex items-center justify-between px-4 py-3 bg-bg-dark border border-border-dark rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-900/50 border border-purple-600/30 flex items-center justify-center text-[11px] font-bold text-purple-300">
                              {u.prenom[0]}{u.nom[0]}
                            </div>
                            <div>
                              <span className="text-slate-200 text-sm font-medium">{u.prenom} {u.nom}</span>
                              <span className="text-slate-500 text-xs block">{u.email}</span>
                            </div>
                          </div>
                          <RoleBadge role={u.role} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Développeurs */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-blue-400">code</span>
                    Développeurs ({developpeurs.length})
                  </h3>
                  {developpeurs.length === 0 ? (
                    <p className="text-slate-600 text-sm italic">Aucun développeur enregistré.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {developpeurs.map((u) => (
                        <div key={u.id} className="flex items-center justify-between px-4 py-3 bg-bg-dark border border-border-dark rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-900/50 border border-blue-600/30 flex items-center justify-center text-[11px] font-bold text-blue-300">
                              {u.prenom[0]}{u.nom[0]}
                            </div>
                            <div>
                              <span className="text-slate-200 text-sm font-medium">{u.prenom} {u.nom}</span>
                              <span className="text-slate-500 text-xs block">{u.email}</span>
                            </div>
                          </div>
                          <RoleBadge role={u.role} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Section>

          {/* Gestion des équipes — à venir */}
          <Section icon="account_tree" iconClass="text-amber-400" title="Gestion des équipes">
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-700">construction</span>
              <p className="text-slate-400 font-medium">Fonctionnalité à venir</p>
              <p className="text-slate-600 text-sm max-w-md">
                La gestion des équipes permettra d'assigner des développeurs à des responsables,
                de créer des équipes et de définir les périmètres de déploiement.
              </p>
            </div>
          </Section>

        </div>
      </div>
    </div>
  )
}
