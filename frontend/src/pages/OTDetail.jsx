import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'
import StatusBadge from '../components/StatusBadge'
import ProfileModal from '../components/ProfileModal'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR') + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function StatPanel({ icon, label, value, valueClass, mono, barColor, barWidth = '100%', accent }) {
  return (
    <div className={`bg-panel-dark border rounded-lg p-4 flex flex-col justify-between h-24 hover:border-slate-500 transition-colors ${accent || 'border-border-dark'}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="material-symbols-outlined text-[16px] text-slate-600">{icon}</span>
      </div>
      <span className={`text-xl font-bold truncate ${valueClass || 'text-white'} ${mono ? 'font-mono' : ''}`}>{value}</span>
      {barColor && (
        <div className="w-full h-0.5 bg-black/40 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: barWidth }} />
        </div>
      )}
    </div>
  )
}

function Panel({ children, className = '' }) {
  return (
    <div className={`bg-panel-dark border border-border-dark rounded-lg overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

function PanelHead({ icon, iconClass, title }) {
  return (
    <div className="px-5 py-3 border-b border-border-dark flex items-center gap-2 bg-surface-lighter/30">
      <span className={`material-symbols-outlined text-[16px] ${iconClass}`}>{icon}</span>
      <span className="text-sm font-semibold text-slate-200">{title}</span>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-slate-500">{label}</span>
      {children}
    </div>
  )
}

export default function OTDetail({ ots, onValidateMEP, onCancelMEP, onDelete, currentUser }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showMEPModal, setShowMEPModal] = useState(false)
  const [showCancelMEPModal, setShowCancelMEPModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [pending, setPending] = useState(null) // 'mep' | 'cancel_mep' | 'delete'
  const [profileModalId, setProfileModalId] = useState(null)

  const ot = ots.find((o) => o.id === parseInt(id))

  if (!ot) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-dark">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-slate-600 mb-4 block">search_off</span>
          <p className="text-slate-400 mb-4">Ordre de transport introuvable</p>
          <button onClick={() => navigate('/')} className="text-primary hover:underline text-sm">← Retour à la liste</button>
        </div>
      </div>
    )
  }

  const handleValidateMEP = async () => {
    setShowMEPModal(false)
    setPending('mep')
    try {
      await onValidateMEP(ot.id, currentUser)
    } finally {
      setPending(null)
    }
  }

  const handleCancelMEP = async () => {
    setShowCancelMEPModal(false)
    setPending('cancel_mep')
    try {
      await onCancelMEP(ot.id)
    } finally {
      setPending(null)
    }
  }

  const handleDelete = async () => {
    setShowDeleteModal(false)
    setPending('delete')
    try {
      await onDelete(ot.id)
      navigate('/')
    } finally {
      setPending(null)
    }
  }

  const deployDate = new Date(ot.date_souhaitee)

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-bg-dark">

      {/* Header — même structure que OTList */}
      <header className="h-16 bg-bg-dark border-b border-border-dark flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Bouton retour */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white hover:bg-surface-lighter px-2 py-1.5 rounded transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="text-sm font-medium">Retour</span>
          </button>
          <div className="h-4 w-px bg-border-dark shrink-0" />
          <h1 className="text-lg font-semibold text-slate-100 truncate">{ot.numero_ot}</h1>
          <StatusBadge mepEffectuee={ot.mep_effectuee} />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate(`/ot/${ot.id}/edit`)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border-dark text-slate-300 rounded hover:bg-surface-lighter text-sm font-medium transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Modifier
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={!!pending}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-danger/30 text-danger rounded hover:bg-danger/10 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Supprimer
          </button>
        </div>
      </header>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto p-6 flex flex-col gap-5">

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatPanel icon="tag" label="N° OT" value={ot.numero_ot} valueClass="text-primary" mono barColor="bg-primary" barWidth="80%" accent="border-primary/20" />
          <StatPanel icon="package_2" label="Lot de transport" value={`Lot ${ot.lot_transport}`} valueClass="text-blue-300" barColor="bg-blue-400" barWidth="60%" accent="border-blue-500/20" />
          <StatPanel icon="sort" label="Ordre de passage" value={`#${ot.ordre_passage}`} valueClass="text-amber-300" barColor="bg-amber-400" barWidth="40%" accent="border-amber-500/20" />
          <StatPanel icon="calendar_today" label="Date souhaitée" value={deployDate.toLocaleDateString('fr-FR')} barColor="bg-slate-600" />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Colonne gauche */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Identification */}
            <Panel>
              <PanelHead icon="badge" iconClass="text-primary" title="Identification" />
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Titulaire">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-900/60 border border-indigo-600/40 flex items-center justify-center text-[11px] font-bold text-indigo-300">
                      {ot.titulaire.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-slate-200 text-sm">{ot.titulaire}</span>
                  </div>
                </Field>
                <Field label="Demandeur">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-teal-900/60 border border-teal-600/40 flex items-center justify-center text-[11px] font-bold text-teal-300">
                      {ot.demandeur.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-slate-200 text-sm">{ot.demandeur}</span>
                  </div>
                </Field>
                <Field label="N° Demande (Mantis / Redmine)">
                  <span className="inline-flex items-center gap-1.5 font-mono text-sm bg-slate-800 text-slate-200 border border-border-dark px-2.5 py-1 rounded w-fit">
                    <span className="material-symbols-outlined text-slate-500 text-[14px]">bug_report</span>
                    {ot.numero_demande}
                  </span>
                </Field>
                <Field label="Intitulé (désignation)">
                  <span className="text-slate-200 text-sm leading-snug">{ot.intitule}</span>
                </Field>
              </div>
            </Panel>

            {/* Planification */}
            <Panel>
              <PanelHead icon="schedule" iconClass="text-amber-400" title="Planification" />
              <div className="p-5 flex flex-col gap-5">
                {/* Timeline */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center">
                    <div className="w-7 h-7 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-[13px]">add_circle</span>
                    </div>
                    <div className={`flex-1 h-px mx-2 ${ot.mep_effectuee ? 'bg-success' : 'bg-border-dark'}`} />
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${ot.mep_effectuee ? 'bg-success/20 border-success' : 'bg-surface-lighter border-border-dark'}`}>
                      <span className={`material-symbols-outlined text-[13px] ${ot.mep_effectuee ? 'text-success' : 'text-slate-600'}`}>rocket_launch</span>
                    </div>
                  </div>
                  <div className="flex justify-between px-0.5">
                    <span className="text-[11px] text-slate-500">Créé</span>
                    <span className="text-[11px] text-slate-500">MEP</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Field label="Date souhaitée">
                    <span className="text-slate-200 text-sm font-medium">{deployDate.toLocaleDateString('fr-FR')}</span>
                  </Field>
                  <Field label="Heure souhaitée">
                    <span className="text-amber-300 text-sm font-medium">{deployDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </Field>
                  <Field label="Lot de transport">
                    <span className="inline-flex items-center gap-1.5 text-sm text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded w-fit">
                      <span className="material-symbols-outlined text-[14px]">package_2</span>
                      Lot {ot.lot_transport}
                    </span>
                  </Field>
                  <Field label="Ordre de passage">
                    <span className="text-2xl font-bold text-amber-300">#{ot.ordre_passage}</span>
                  </Field>
                </div>
              </div>
            </Panel>

            {/* Remarque */}
            <Panel>
              <PanelHead icon="notes" iconClass="text-slate-500" title="Remarque" />
              <div className="p-5">
                {ot.remarque
                  ? <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{ot.remarque}</p>
                  : <p className="text-slate-600 text-sm italic">Aucune remarque.</p>
                }
              </div>
            </Panel>
          </div>

          {/* Colonne droite */}
          <div className="lg:col-span-1 flex flex-col gap-4">

            {/* Panel MEP */}
            {!ot.mep_effectuee ? (
              <Panel>
                <div className="h-0.5 bg-gradient-to-r from-primary to-purple-500" />
                <PanelHead icon="published_with_changes" iconClass="text-primary" title="Validation MEP" />
                <div className="p-5 flex flex-col gap-4">
                  <p className="text-sm text-slate-400">
                    Confirmez que le déploiement de cet OT a bien été effectué en production.
                  </p>
                  <div className="bg-bg-dark border border-border-dark rounded divide-y divide-border-dark text-sm">
                    <div className="flex justify-between px-3 py-2">
                      <span className="text-slate-500">Cible</span>
                      <span className="text-slate-300">serveur santé&amp;cie</span>
                    </div>
                    <div className="flex justify-between px-3 py-2">
                      <span className="text-slate-500">Heure prévue</span>
                      <span className="text-amber-300 font-medium">{deployDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2">
                      <span className="text-slate-500">Date</span>
                      <span className="text-slate-300">{deployDate.toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMEPModal(true)}
                    disabled={!!pending}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    Valider la MEP
                  </button>
                  <p className="text-xs text-slate-600 text-center">Action irréversible</p>
                </div>
              </Panel>
            ) : (
              <Panel className="border-success/30">
                <div className="h-0.5 bg-success" />
                <PanelHead icon="verified" iconClass="text-success" title="MEP effectuée" />
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-3 p-3 bg-success/10 rounded border border-success/20">
                    <span className="material-symbols-outlined text-success text-2xl">check_circle</span>
                    <div>
                      <span className="text-success font-semibold text-sm block">Déploiement confirmé</span>
                      <span className="text-slate-400 text-xs">Production OK</span>
                    </div>
                  </div>
                  <Field label="Validée par">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-success/20 border border-success/30 flex items-center justify-center text-[10px] font-bold text-success">
                        {ot.mep_effectuee_par?.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-slate-200 text-sm">{ot.mep_effectuee_par}</span>
                    </div>
                  </Field>
                  <Field label="Date et heure">
                    <span className="text-slate-200 text-sm">{formatDate(ot.mep_date)}</span>
                  </Field>
                  <button
                    onClick={() => setShowCancelMEPModal(true)}
                    disabled={!!pending}
                    className="w-full flex items-center justify-center gap-2 border border-danger/30 text-danger hover:bg-danger/10 text-sm font-medium py-2 px-4 rounded transition-all mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    Annuler la MEP
                  </button>
                </div>
              </Panel>
            )}

            </div>
        </div>
      </div>
      </div>

      {profileModalId && (
        <ProfileModal
          userId={profileModalId}
          currentUser={currentUser}
          onClose={() => setProfileModalId(null)}
        />
      )}

      {showMEPModal && (
        <ConfirmModal
          title="Confirmer la validation MEP"
          message={`Confirmez-vous que la mise en production de l'OT ${ot.numero_ot} a bien été effectuée ? Cette action est irréversible.`}
          confirmLabel="Confirmer la MEP"
          confirmClass="bg-primary hover:bg-blue-600"
          onConfirm={handleValidateMEP}
          onCancel={() => setShowMEPModal(false)}
        />
      )}

      {showCancelMEPModal && (
        <ConfirmModal
          title="Annuler la MEP"
          message={`Êtes-vous sûr de vouloir annuler la validation MEP de l'OT ${ot.numero_ot} ? L'OT repassera en statut "En attente".`}
          confirmLabel="Annuler la MEP"
          confirmClass="bg-danger hover:bg-red-700"
          onConfirm={handleCancelMEP}
          onCancel={() => setShowCancelMEPModal(false)}
        />
      )}

      {showDeleteModal && (
        <ConfirmModal
          title="Supprimer l'OT"
          message={`Êtes-vous sûr de vouloir supprimer l'OT ${ot.numero_ot} ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          confirmClass="bg-danger hover:bg-red-700"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  )
}
