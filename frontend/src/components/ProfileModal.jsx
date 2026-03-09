import { useState, useEffect, useCallback } from 'react'
import { fetchUser } from '../services/api'

function Avatar({ user, colorClass, size = 'lg' }) {
  const sz = size === 'lg' ? 'w-16 h-16 text-2xl' : 'w-9 h-9 text-sm'
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-bold shrink-0 ${colorClass}`}>
      {user.prenom[0]}{user.nom[0]}
    </div>
  )
}

export default function ProfileModal({ userId: initialId, currentUser, onClose }) {
  const [stack, setStack] = useState([initialId])
  const userId = stack[stack.length - 1]
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setProfile(null)
    fetchUser(userId).then(setProfile).finally(() => setLoading(false))
  }, [userId])

  const navigate = useCallback((id) => setStack((s) => [...s, id]), [])
  const goBack = useCallback(() => setStack((s) => s.slice(0, -1)), [])

  const isResp = profile?.role === 'responsable'
  const avatarColor = isResp
    ? 'bg-purple-900/60 border border-purple-500/30 text-purple-300'
    : 'bg-blue-900/60 border border-blue-500/30 text-blue-300'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-panel-dark border border-border-dark rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-dark">
          <div className="flex items-center gap-2">
            {stack.length > 1 && (
              <button
                onClick={goBack}
                className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </button>
            )}
            <span className="text-sm font-semibold text-slate-200">
              {loading ? 'Profil' : `${profile?.prenom} ${profile?.nom}`}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <p className="text-slate-500 text-sm py-8 text-center">Chargement...</p>
          ) : !profile ? (
            <p className="text-slate-500 text-sm py-8 text-center">Profil introuvable.</p>
          ) : (
            <div className="flex flex-col gap-5">

              {/* Identité */}
              <div className="flex items-center gap-4">
                <Avatar user={profile} colorClass={avatarColor} size="lg" />
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-bold text-lg leading-tight">
                      {profile.prenom} {profile.nom}
                    </span>
                    {profile.id === currentUser.id && (
                      <span className="text-xs text-slate-600">(Vous)</span>
                    )}
                  </div>
                  <span className="text-slate-400 text-sm truncate">{profile.email}</span>
                  <span className="text-xs mt-1" style={{ color: isResp ? '#a78bfa99' : '#60a5fa80' }}>
                    {isResp ? '● Responsable' : '● Développeur'}
                  </span>
                </div>
              </div>

              {/* Responsable (devs uniquement) */}
              {!isResp && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Responsable</p>
                  {profile.responsable ? (
                    <div
                      onClick={() => navigate(profile.responsable.id)}
                      className="flex items-center gap-3 px-3 py-2.5 bg-bg-dark border border-border-dark rounded-lg hover:border-slate-600 transition-colors cursor-pointer"
                    >
                      <Avatar
                        user={profile.responsable}
                        size="sm"
                        colorClass="bg-purple-900/50 border border-purple-600/30 text-purple-300"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-slate-200 text-sm font-medium">
                          {profile.responsable.prenom} {profile.responsable.nom}
                          {profile.responsable.id === currentUser.id && (
                            <span className="ml-1.5 text-xs text-slate-600">(Vous)</span>
                          )}
                        </span>
                        <span className="text-slate-500 text-xs truncate">{profile.responsable.email}</span>
                      </div>
                      <span className="material-symbols-outlined text-slate-600 text-[16px] ml-auto shrink-0">chevron_right</span>
                    </div>
                  ) : (
                    <p className="text-slate-600 text-sm">Aucun responsable assigné</p>
                  )}
                </div>
              )}

              {/* Équipe */}
              <div>
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  {isResp
                    ? `Équipe · ${profile.equipe.length} développeur${profile.equipe.length !== 1 ? 's' : ''}`
                    : `Collègues · ${profile.equipe.length}`}
                </p>
                {profile.equipe.length === 0 ? (
                  <p className="text-slate-600 text-sm">
                    {isResp ? 'Aucun développeur dans cette équipe.' : 'Aucun collègue dans cette équipe.'}
                  </p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {profile.equipe.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => navigate(m.id)}
                        className="flex items-center gap-3 px-3 py-2.5 bg-bg-dark border border-border-dark rounded-lg hover:border-slate-600 transition-colors cursor-pointer"
                      >
                        <Avatar
                          user={m}
                          size="sm"
                          colorClass="bg-blue-900/50 border border-blue-600/30 text-blue-300"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-slate-200 text-sm font-medium">
                            {m.prenom} {m.nom}
                            {m.id === currentUser.id && (
                              <span className="ml-1.5 text-xs text-slate-600">(Vous)</span>
                            )}
                          </span>
                          <span className="text-slate-500 text-xs truncate">{m.email}</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-600 text-[16px] shrink-0">chevron_right</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
