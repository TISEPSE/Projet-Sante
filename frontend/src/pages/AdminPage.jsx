import { useState, useEffect } from 'react'
import { adminOverview, adminAddToTeam, adminRemoveFromTeam } from '../services/api'
import ConfirmModal from '../components/ConfirmModal'

function Avatar({ user, colorClass }) {
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${colorClass}`}>
      {user.prenom[0]}{user.nom[0]}
    </div>
  )
}

function PickerModal({ title, items, colorClass, onSelect, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-panel-dark border border-border-dark rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-5 py-4 border-b border-border-dark flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button onClick={onCancel} className="text-slate-500 hover:text-slate-300 transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="p-3 flex flex-col gap-1.5 max-h-72 overflow-auto">
          {items.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-6">Aucun élément disponible</p>
          )}
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="flex items-center gap-3 px-3 py-2.5 bg-bg-dark border border-border-dark rounded-lg hover:border-slate-500 hover:bg-surface-lighter/10 transition-colors text-left w-full"
            >
              <Avatar user={item} colorClass={colorClass} />
              <div className="min-w-0">
                <p className="text-slate-200 text-sm font-medium">{item.prenom} {item.nom}</p>
                <p className="text-slate-500 text-xs truncate">{item.email}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-border-dark flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border border-border-dark text-slate-300 hover:bg-surface-lighter text-sm font-medium transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [removeModal, setRemoveModal] = useState(null)
  const [addModal, setAddModal] = useState(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    adminOverview()
      .then(setOverview)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async () => {
    if (!removeModal || pending) return
    setPending(true)
    try {
      await adminRemoveFromTeam(removeModal.responsable.id, removeModal.dev.id)
      setOverview((prev) => ({
        ...prev,
        responsables: prev.responsables.map((r) =>
          r.id === removeModal.responsable.id
            ? { ...r, equipe: r.equipe.filter((d) => d.id !== removeModal.dev.id) }
            : r
        ),
        unassigned: [...prev.unassigned, removeModal.dev].sort((a, b) => a.nom.localeCompare(b.nom)),
      }))
      setRemoveModal(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  const handleAdd = async () => {
    if (!addModal?.dev || !addModal?.responsable || pending) return
    setPending(true)
    try {
      const updated = await adminAddToTeam(addModal.responsable.id, addModal.dev.id)
      setOverview((prev) => ({
        ...prev,
        responsables: prev.responsables.map((r) =>
          r.id === addModal.responsable.id
            ? { ...r, equipe: [...r.equipe, updated].sort((a, b) => a.nom.localeCompare(b.nom)) }
            : r
        ),
        unassigned: prev.unassigned.filter((d) => d.id !== addModal.dev.id),
      }))
      setAddModal(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 bg-bg-dark">
        Chargement...
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-bg-dark">
      <header className="h-16 bg-bg-dark border-b border-border-dark flex items-center px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-400 text-[20px]">admin_panel_settings</span>
          <h1 className="text-lg font-semibold text-slate-100">Administration</h1>
        </div>
      </header>

      {error && (
        <div className="mx-6 mt-4 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="ml-3 font-bold">✕</button>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">

          {/* Équipes des responsables */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-purple-400 text-[18px]">groups</span>
              <h2 className="text-sm font-semibold text-slate-300">
                Équipes · {overview.responsables.length} responsable{overview.responsables.length !== 1 ? 's' : ''}
              </h2>
            </div>

            {overview.responsables.length === 0 ? (
              <div className="bg-panel-dark border border-border-dark rounded-lg px-5 py-10 text-center">
                <p className="text-slate-500 text-sm">Aucun responsable enregistré.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {overview.responsables.map((resp) => (
                  <div key={resp.id} className="bg-panel-dark border border-border-dark rounded-lg overflow-hidden">
                    {/* En-tête responsable */}
                    <div className="px-4 py-3 border-b border-border-dark bg-surface-lighter/10 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <Avatar user={resp} colorClass="bg-purple-900/50 border border-purple-600/30 text-purple-300" />
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-purple-500/80 border-2 border-panel-dark flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-[9px]">star</span>
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-200 text-sm font-semibold">{resp.prenom} {resp.nom}</p>
                          <p className="text-slate-500 text-xs truncate">{resp.email}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-600 shrink-0 ml-2">
                        {resp.equipe.length} dev{resp.equipe.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Liste des devs */}
                    <div className="p-3 flex flex-col gap-1.5">
                      {resp.equipe.length === 0 && (
                        <p className="text-slate-600 text-sm px-2 py-3 text-center">
                          Aucun développeur dans cette équipe
                        </p>
                      )}
                      {resp.equipe.map((dev) => (
                        <div
                          key={dev.id}
                          className="flex items-center justify-between px-3 py-2 bg-bg-dark border border-border-dark rounded-lg"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar user={dev} colorClass="bg-blue-900/50 border border-blue-600/30 text-blue-300" />
                            <div className="min-w-0">
                              <p className="text-slate-200 text-sm font-medium truncate">{dev.prenom} {dev.nom}</p>
                              <p className="text-slate-500 text-xs truncate">{dev.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setRemoveModal({ dev, responsable: resp })}
                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/60 px-2.5 py-1.5 rounded transition-colors shrink-0 ml-2"
                          >
                            <span className="material-symbols-outlined text-[14px]">person_remove</span>
                            Retirer
                          </button>
                        </div>
                      ))}

                      {overview.unassigned.length > 0 && (
                        <button
                          onClick={() => setAddModal({ step: 'pick-dev', responsable: resp })}
                          className="flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-primary border border-dashed border-border-dark hover:border-primary/50 px-3 py-2 rounded transition-colors mt-1 w-full"
                        >
                          <span className="material-symbols-outlined text-[14px]">person_add</span>
                          Ajouter un développeur
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Développeurs sans responsable */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-slate-500 text-[18px]">person_off</span>
              <h2 className="text-sm font-semibold text-slate-300">
                Sans responsable · {overview.unassigned.length}
              </h2>
            </div>

            {overview.unassigned.length === 0 ? (
              <div className="bg-panel-dark border border-border-dark rounded-lg px-5 py-10 flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl text-green-600/50">check_circle</span>
                <p className="text-slate-500 text-sm">Tous les développeurs sont affectés à une équipe.</p>
              </div>
            ) : (
              <div className="bg-panel-dark border border-border-dark rounded-lg overflow-hidden">
                <div className="divide-y divide-border-dark">
                  {overview.unassigned.map((dev) => (
                    <div key={dev.id} className="flex items-center justify-between px-4 py-3 hover:bg-surface-lighter/10 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar user={dev} colorClass="bg-slate-700 border border-slate-600/30 text-slate-300" />
                        <div className="min-w-0">
                          <p className="text-slate-200 text-sm font-medium truncate">{dev.prenom} {dev.nom}</p>
                          <p className="text-slate-500 text-xs truncate">{dev.email}</p>
                        </div>
                      </div>
                      {overview.responsables.length > 0 && (
                        <button
                          onClick={() => setAddModal({ step: 'pick-resp', dev })}
                          className="flex items-center gap-1.5 text-xs text-primary hover:text-blue-300 border border-primary/30 hover:border-primary/60 px-3 py-1.5 rounded transition-colors shrink-0 ml-3"
                        >
                          <span className="material-symbols-outlined text-[14px]">assignment_ind</span>
                          Affecter
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal confirmation retrait */}
      {removeModal && (
        <ConfirmModal
          title={`Retirer ${removeModal.dev.prenom} ${removeModal.dev.nom} ?`}
          message={`${removeModal.dev.prenom} ${removeModal.dev.nom} sera retiré(e) de l'équipe de ${removeModal.responsable.prenom} ${removeModal.responsable.nom} et passera sans responsable.`}
          confirmLabel={pending ? '...' : 'Retirer'}
          confirmClass="bg-red-600 hover:bg-red-500"
          onConfirm={handleRemove}
          onCancel={() => { if (!pending) setRemoveModal(null) }}
        />
      )}

      {/* Sélection du dev à ajouter (depuis la carte responsable) */}
      {addModal?.step === 'pick-dev' && (
        <PickerModal
          title={`Ajouter à l'équipe de ${addModal.responsable.prenom} ${addModal.responsable.nom}`}
          items={overview.unassigned}
          colorClass="bg-blue-900/50 border border-blue-600/30 text-blue-300"
          onSelect={(dev) => setAddModal({ step: 'confirm', dev, responsable: addModal.responsable })}
          onCancel={() => setAddModal(null)}
        />
      )}

      {/* Sélection du responsable (depuis un dev non affecté) */}
      {addModal?.step === 'pick-resp' && (
        <PickerModal
          title={`Affecter ${addModal.dev.prenom} ${addModal.dev.nom} à...`}
          items={overview.responsables}
          colorClass="bg-purple-900/50 border border-purple-600/30 text-purple-300"
          onSelect={(responsable) => setAddModal({ step: 'confirm', dev: addModal.dev, responsable })}
          onCancel={() => setAddModal(null)}
        />
      )}

      {/* Modal confirmation ajout */}
      {addModal?.step === 'confirm' && (
        <ConfirmModal
          title="Confirmer l'affectation"
          message={`Affecter ${addModal.dev.prenom} ${addModal.dev.nom} à l'équipe de ${addModal.responsable.prenom} ${addModal.responsable.nom} ?`}
          confirmLabel={pending ? '...' : 'Ajouter'}
          confirmClass="bg-primary hover:bg-blue-500"
          onConfirm={handleAdd}
          onCancel={() => { if (!pending) setAddModal(null) }}
        />
      )}
    </div>
  )
}
