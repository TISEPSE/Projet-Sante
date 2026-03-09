import { useState, useEffect } from 'react'
import { fetchUsers, fetchUser, addToTeam, removeFromTeam } from '../services/api'
import ProfileModal from '../components/ProfileModal'

function Avatar({ user, size = 'md', colorClass }) {
  const sizeClass = size === 'lg' ? 'w-14 h-14 text-xl' : 'w-9 h-9 text-sm'
  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold shrink-0 ${colorClass}`}>
      {user.prenom[0]}{user.nom[0]}
    </div>
  )
}

function Section({ icon, iconClass = 'text-primary', title, action, children }) {
  return (
    <div className="bg-panel-dark border border-border-dark rounded-lg overflow-hidden">
      <div className="px-5 py-3 border-b border-border-dark flex items-center justify-between bg-surface-lighter/30">
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-[16px] ${iconClass}`}>{icon}</span>
          <span className="text-sm font-semibold text-slate-200">{title}</span>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function Settings({ currentUser }) {
  const [myProfile, setMyProfile] = useState(null)
  const [allDevs, setAllDevs] = useState([])
  const [search, setSearch] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [pending, setPending] = useState(null)
  const [modalId, setModalId] = useState(null)

  useEffect(() => {
    Promise.all([
      fetchUsers().then((users) => setAllDevs(users.filter((u) => u.role === 'developpeur'))),
      fetchUser(currentUser.id).then(setMyProfile),
    ]).finally(() => setLoadingUsers(false))
  }, [currentUser.id])

  const filteredDevs = allDevs.filter((u) => {
    const q = search.toLowerCase()
    return (
      u.prenom.toLowerCase().includes(q) ||
      u.nom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    )
  })

  const handleToggleTeam = async (e, dev) => {
    e.stopPropagation()
    setPending(dev.id)
    try {
      const isInMyTeam = dev.responsable_id === currentUser.id
      const updated = isInMyTeam ? await removeFromTeam(dev.id) : await addToTeam(dev.id)
      setAllDevs((prev) => prev.map((u) => (u.id === dev.id ? updated : u)))
      setMyProfile((prev) => {
        if (!prev) return prev
        if (isInMyTeam) {
          return { ...prev, equipe: prev.equipe.filter((m) => m.id !== dev.id) }
        } else {
          return { ...prev, equipe: [...prev.equipe, updated].sort((a, b) => a.nom.localeCompare(b.nom)) }
        }
      })
    } finally {
      setPending(null)
    }
  }

  const isResp = currentUser.role === 'responsable'

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-bg-dark">
      <header className="h-16 bg-bg-dark border-b border-border-dark flex items-center px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-slate-400 text-[20px]">settings</span>
          <h1 className="text-lg font-semibold text-slate-100">Paramètres</h1>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">

          {/* Mon profil */}
          <Section icon="person" title="Mon profil">
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <Avatar
                  user={currentUser}
                  size="lg"
                  colorClass="bg-primary/20 border border-primary/30 text-primary"
                />
                {/* Indicateur de rôle sur l'avatar */}
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-panel-dark flex items-center justify-center"
                  style={{ backgroundColor: isResp ? 'rgba(168,85,247,0.8)' : 'rgba(59,130,246,0.8)' }}
                  title={isResp ? 'Responsable' : 'Développeur'}
                >
                  <span className="material-symbols-outlined text-white text-[10px]">
                    {isResp ? 'star' : 'code'}
                  </span>
                </span>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-white font-semibold text-lg leading-tight">
                  {currentUser.prenom} {currentUser.nom}
                </p>
                <p className="text-slate-400 text-sm truncate">{currentUser.email}</p>
                <p className="text-xs" style={{ color: isResp ? '#a78bfa80' : '#60a5fa80' }}>
                  {isResp ? '● Responsable' : '● Développeur'}
                </p>
              </div>
            </div>

            {/* Infos équipe */}
            {myProfile && (
              <div className="mt-5 pt-5 border-t border-border-dark flex flex-col gap-4">

                {/* Responsable (devs uniquement) */}
                {!isResp && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Responsable</p>
                    {myProfile.responsable ? (
                      <div
                        onClick={() => setModalId(myProfile.responsable.id)}
                        className="flex items-center gap-3 px-3 py-2.5 bg-bg-dark border border-border-dark rounded-lg hover:border-slate-600 transition-colors cursor-pointer w-fit"
                      >
                        <Avatar
                          user={myProfile.responsable}
                          colorClass="bg-purple-900/50 border border-purple-600/30 text-purple-300"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-slate-200 text-sm font-medium">
                            {myProfile.responsable.prenom} {myProfile.responsable.nom}
                          </span>
                          <span className="text-slate-500 text-xs">{myProfile.responsable.email}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-600 text-sm">Aucun responsable assigné</p>
                    )}
                  </div>
                )}

                {/* Équipe / Collègues */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    {isResp ? `Mon équipe · ${myProfile.equipe.length}` : `Collègues · ${myProfile.equipe.length}`}
                  </p>
                  {myProfile.equipe.length === 0 ? (
                    <p className="text-slate-600 text-sm">
                      {isResp ? 'Aucun développeur dans votre équipe.' : 'Aucun collègue dans votre équipe.'}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {myProfile.equipe.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => setModalId(m.id)}
                          className="flex items-center gap-2 px-3 py-2 bg-bg-dark border border-border-dark rounded-lg hover:border-slate-600 transition-colors cursor-pointer"
                        >
                          <Avatar user={m} colorClass="bg-blue-900/50 border border-blue-600/30 text-blue-300" />
                          <span className="text-slate-200 text-sm font-medium">{m.prenom} {m.nom}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </Section>

          {/* Développeurs */}
          <Section
            icon="code"
            iconClass="text-blue-400"
            title={`Développeurs${!loadingUsers ? ` (${allDevs.length})` : ''}`}
            action={
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-500 text-[16px]">search</span>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="pl-8 pr-3 py-1.5 bg-bg-dark border border-border-dark rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary w-64 transition-all"
                />
              </div>
            }
          >
            {loadingUsers ? (
              <p className="text-slate-500 text-sm">Chargement...</p>
            ) : filteredDevs.length === 0 ? (
              <div className="py-8 text-center">
                <span className="material-symbols-outlined text-3xl text-slate-700 block mb-2">person_off</span>
                <p className="text-slate-500 text-sm">
                  {search ? 'Aucun développeur ne correspond à la recherche.' : 'Aucun développeur enregistré.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredDevs.map((u) => {
                  const isInMyTeam = u.responsable_id === currentUser.id
                  const isLoading = pending === u.id
                  return (
                    <div
                      key={u.id}
                      onClick={() => setModalId(u.id)}
                      className="flex items-center justify-between px-4 py-3 bg-bg-dark border border-border-dark rounded-lg hover:border-slate-600 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <Avatar user={u} colorClass="bg-blue-900/50 border border-blue-600/30 text-blue-300" />
                          {isInMyTeam && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-panel-dark" title="Dans votre équipe" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-slate-200 text-sm font-medium">{u.prenom} {u.nom}</span>
                          <span className="text-slate-500 text-xs truncate">{u.email}</span>
                        </div>
                      </div>
                      {currentUser.role === 'responsable' && (
                        <button
                          disabled={isLoading}
                          onClick={(e) => handleToggleTeam(e, u)}
                          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded transition-colors shrink-0 ml-3 disabled:opacity-50 ${
                            isInMyTeam
                              ? 'text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/60'
                              : 'text-primary hover:text-blue-300 border border-primary/30 hover:border-primary/60'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {isInMyTeam ? 'person_remove' : 'person_add'}
                          </span>
                          {isInMyTeam ? 'Retirer' : 'Ajouter'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Section>

        </div>
      </div>

      {modalId && (
        <ProfileModal
          userId={modalId}
          currentUser={currentUser}
          onClose={() => setModalId(null)}
        />
      )}
    </div>
  )
}
