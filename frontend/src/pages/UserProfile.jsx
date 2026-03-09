import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchUser } from '../services/api'

function Avatar({ user, size = 'md', colorClass }) {
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-2xl' : 'w-9 h-9 text-sm'
  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold shrink-0 ${colorClass}`}>
      {user.prenom[0]}{user.nom[0]}
    </div>
  )
}

function InfoCard({ icon, iconClass, title, children }) {
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

export default function UserProfile({ currentUser }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchUser(id)
      .then(setProfile)
      .catch(() => setError('Profil introuvable.'))
      .finally(() => setLoading(false))
  }, [id])

  const isResp = profile?.role === 'responsable'
  const avatarColor = isResp
    ? 'bg-purple-900/50 border border-purple-600/30 text-purple-300'
    : 'bg-blue-900/50 border border-blue-600/30 text-blue-300'

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-bg-dark">
      <header className="h-16 bg-bg-dark border-b border-border-dark flex items-center px-6 flex-shrink-0 gap-3">
        <button
          onClick={() => navigate('/parametres')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white hover:bg-surface-lighter px-2 py-1.5 rounded transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="text-sm font-medium">Retour</span>
        </button>
        <div className="h-4 w-px bg-border-dark" />
        <span className="text-slate-500 text-sm">
          {profile ? `${profile.prenom} ${profile.nom}` : 'Profil'}
        </span>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <p className="text-slate-500 text-sm">Chargement...</p>
        ) : error ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-700 block mb-2">person_off</span>
            <p className="text-slate-500">{error}</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto flex flex-col gap-6">

            {/* Profil */}
            <div className="bg-panel-dark border border-border-dark rounded-lg p-6 flex items-center gap-5">
              <Avatar user={profile} size="lg" colorClass={avatarColor} />
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-bold text-xl leading-tight">{profile.prenom} {profile.nom}</p>
                  {profile.id === currentUser.id && (
                    <span className="text-xs text-slate-500">(Vous)</span>
                  )}
                </div>
                <p className="text-slate-400 text-sm truncate">{profile.email}</p>
                <span style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  width: 'fit-content',
                  backgroundColor: isResp ? 'rgba(168,85,247,0.15)' : 'rgba(59,130,246,0.15)',
                  color: isResp ? '#c4b5fd' : '#93c5fd',
                }}>
                  {isResp ? 'Responsable' : 'Développeur'}
                </span>
              </div>
            </div>

            {/* Responsable (uniquement pour les développeurs) */}
            {!isResp && (
              <InfoCard icon="manage_accounts" iconClass="text-purple-400" title="Responsable">
                {profile.responsable ? (
                  <div
                    onClick={() => navigate(`/profil/${profile.responsable.id}`)}
                    className="flex items-center gap-3 px-4 py-3 bg-bg-dark border border-border-dark rounded-lg hover:border-slate-600 transition-colors cursor-pointer w-fit"
                  >
                    <Avatar user={profile.responsable} colorClass="bg-purple-900/50 border border-purple-600/30 text-purple-300" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-slate-200 text-sm font-medium">
                        {profile.responsable.prenom} {profile.responsable.nom}
                        {profile.responsable.id === currentUser.id && <span className="ml-2 text-xs text-slate-500">(Vous)</span>}
                      </span>
                      <span className="text-slate-500 text-xs">{profile.responsable.email}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-600 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">person_off</span>
                    Aucun responsable assigné
                  </p>
                )}
              </InfoCard>
            )}

            {/* Équipe */}
            <InfoCard
              icon="group"
              iconClass="text-blue-400"
              title={isResp
                ? `Équipe (${profile.equipe.length} développeur${profile.equipe.length !== 1 ? 's' : ''})`
                : `Collègues (${profile.equipe.length})`
              }
            >
              {profile.equipe.length === 0 ? (
                <p className="text-slate-600 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">group_off</span>
                  {isResp ? 'Aucun développeur dans cette équipe.' : 'Aucun collègue dans cette équipe.'}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {profile.equipe.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => navigate(`/profil/${member.id}`)}
                      className="flex items-center gap-3 px-4 py-3 bg-bg-dark border border-border-dark rounded-lg hover:border-slate-600 transition-colors cursor-pointer"
                    >
                      <Avatar user={member} colorClass="bg-blue-900/50 border border-blue-600/30 text-blue-300" />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-slate-200 text-sm font-medium">
                          {member.prenom} {member.nom}
                          {member.id === currentUser.id && <span className="ml-2 text-xs text-slate-500">(Vous)</span>}
                        </span>
                        <span className="text-slate-500 text-xs truncate">{member.email}</span>
                      </div>
                      <span className="material-symbols-outlined text-slate-600 text-[18px] ml-auto">chevron_right</span>
                    </div>
                  ))}
                </div>
              )}
            </InfoCard>

          </div>
        )}
      </div>
    </div>
  )
}
