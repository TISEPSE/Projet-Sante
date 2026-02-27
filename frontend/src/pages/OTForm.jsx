import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const EMPLACEMENT_DEFAULT = 'serveur santé&cie'

// Sera remplacé par un appel API /api/users
const SIMULATED_USERS = [
  'Sophie Leroy',
  'Marc Martin',
  'Lucas Bernard',
  'Alice Petit',
  'Christophe Dubois',
  'Pierre Lefebvre',
]

const EMPTY_FORM = {
  numero_ot: '',
  intitule: '',
  titulaire: '',
  numero_demande: '',
  lot_transport: '',
  ordre_passage: '',
  date_souhaitee: '',
  demandeur: '',
  remarque: '',
}

const getDefaultDate = () => {
  const now = new Date()
  now.setHours(18, 0, 0, 0)
  return now.toISOString().slice(0, 16)
}

function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="text-[11px] text-red-400 flex items-center gap-1">
      <span className="material-symbols-outlined text-[14px]">error</span>
      {message}
    </p>
  )
}

export default function OTForm({ ots, onSave, currentUser }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const existing = isEdit ? ots.find((o) => o.id === parseInt(id)) : null

  const currentUserFullName = currentUser ? `${currentUser.prenom} ${currentUser.nom}` : ''

  // Liste complète pour les selects : l'utilisateur courant en premier
  const userOptions = [
    currentUserFullName,
    ...SIMULATED_USERS.filter((u) => u !== currentUserFullName),
  ]

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isEdit && existing) {
      setForm({
        numero_ot: existing.numero_ot,
        intitule: existing.intitule,
        titulaire: existing.titulaire,
        numero_demande: existing.numero_demande,
        lot_transport: existing.lot_transport,
        ordre_passage: existing.ordre_passage,
        date_souhaitee: existing.date_souhaitee,
        demandeur: existing.demandeur,
        remarque: existing.remarque || '',
      })
    } else {
      setForm({
        ...EMPTY_FORM,
        date_souhaitee: getDefaultDate(),
        titulaire: currentUserFullName,
      })
    }
  }, [isEdit, existing, currentUserFullName])

  const validate = () => {
    const newErrors = {}
    const required = ['numero_ot', 'intitule', 'titulaire', 'numero_demande', 'lot_transport', 'ordre_passage', 'date_souhaitee', 'demandeur']
    required.forEach((field) => {
      if (!form[field] || form[field].toString().trim() === '') {
        newErrors[field] = 'Ce champ est obligatoire'
      }
    })
    const duplicate = ots.find((o) => o.numero_ot === form.numero_ot && o.id !== parseInt(id))
    if (duplicate) newErrors.numero_ot = "Ce numéro d'OT existe déjà"
    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setSubmitting(true)
    try {
      const savedId = await onSave(form, isEdit ? parseInt(id) : null)
      navigate(isEdit ? `/ot/${savedId}` : '/')
    } catch {
      // erreur gérée dans App.jsx
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field) =>
    `w-full bg-input-bg border rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-1 transition-all placeholder-slate-600 ${
      errors[field]
        ? 'border-danger focus:border-danger focus:ring-danger'
        : 'border-border-dark focus:border-primary focus:ring-primary'
    }`

  const selectClass = (field) =>
    `w-full bg-input-bg border rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-1 transition-all appearance-none cursor-pointer ${
      errors[field]
        ? 'border-danger focus:border-danger focus:ring-danger'
        : 'border-border-dark focus:border-primary focus:ring-primary'
    }`

  const textFields = [
    {
      id: 'numero_ot', label: "Numéro de l'OT", required: true,
      placeholder: 'ex: OT-001300', hint: 'Identifiant unique provenant de SAP',
      icon: 'tag', type: 'text',
    },
    {
      id: 'intitule', label: 'Intitulé (désignation)', required: true,
      placeholder: 'Description de la modification...', type: 'text',
    },
    {
      id: 'numero_demande', label: 'Numéro de demande (Mantis/Redmine)', required: true,
      placeholder: 'ex: DMD-420', icon: 'bug_report', type: 'text',
    },
    {
      id: 'lot_transport', label: 'Lot de transport', required: true,
      placeholder: 'ex: 1', type: 'number',
    },
    {
      id: 'ordre_passage', label: 'Ordre de passage', required: true,
      placeholder: 'ex: 1', icon: 'sort', type: 'number',
    },
    {
      id: 'date_souhaitee', label: 'Date et heure souhaitées', required: true,
      hint: 'Heure par défaut : 18h00', icon: 'calendar_today', type: 'datetime-local',
    },
  ]

  return (
    <div className="flex-1 bg-bg-dark overflow-auto">
      <div className="max-w-4xl mx-auto p-6 md:p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <nav className="flex text-sm font-medium text-slate-500">
            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">
              Liste des OT
            </button>
            <span className="mx-2">/</span>
            <span className="text-white">{isEdit ? `Modifier ${existing?.numero_ot}` : 'Créer un OT'}</span>
          </nav>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {isEdit ? "Modifier l'OT" : 'Créer un OT'}
              </h1>
              <p className="text-slate-400 mt-1">
                {isEdit ? 'Modifiez les informations de cet ordre de transport.' : 'Enregistrez un nouvel ordre de transport SAP.'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => navigate(isEdit ? `/ot/${id}` : '/')}
                className="px-4 py-2 rounded border border-border-dark text-slate-300 hover:bg-surface-lighter text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="ot-form"
                disabled={submitting}
                className="px-6 py-2 rounded bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                {isEdit ? 'Enregistrer' : "Créer l'OT"}
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-panel-dark border border-border-dark rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border-dark bg-surface-lighter flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">edit_document</span>
              <h2 className="text-base font-semibold text-white">Détails de l'ordre</h2>
            </div>
            <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400 font-mono">
              {isEdit ? 'Mode édition' : 'Nouveau'}
            </div>
          </div>

          <div className="p-6">
            <form id="ot-form" onSubmit={handleSubmit} className="flex flex-col gap-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">

                {/* Champs texte/number/datetime */}
                {textFields.map((f) => (
                  <div key={f.id} className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider" htmlFor={f.id}>
                      {f.label} {f.required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      {f.icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="material-symbols-outlined text-slate-600 text-[18px]">{f.icon}</span>
                        </div>
                      )}
                      <input
                        id={f.id}
                        name={f.id}
                        type={f.type}
                        value={form[f.id]}
                        onChange={handleChange}
                        placeholder={f.placeholder}
                        className={`${inputClass(f.id)} ${f.icon ? 'pl-10' : ''} [color-scheme:dark]`}
                      />
                    </div>
                    {f.hint && !errors[f.id] && <p className="text-[11px] text-slate-600">{f.hint}</p>}
                    <FieldError message={errors[f.id]} />
                  </div>
                ))}

                {/* Titulaire — select */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider" htmlFor="titulaire">
                    Titulaire <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-600 text-[18px]">person</span>
                    </div>
                    <select
                      id="titulaire"
                      name="titulaire"
                      value={form.titulaire}
                      onChange={handleChange}
                      className={`${selectClass('titulaire')} pl-10 pr-8`}
                    >
                      <option value="" disabled>Sélectionner un titulaire</option>
                      {userOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}{name === currentUserFullName ? ' (Moi)' : ''}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-600 text-[16px]">expand_more</span>
                    </div>
                  </div>
                  <FieldError message={errors.titulaire} />
                </div>

                {/* Demandeur — select */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider" htmlFor="demandeur">
                    Demandeur <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-600 text-[18px]">person</span>
                    </div>
                    <select
                      id="demandeur"
                      name="demandeur"
                      value={form.demandeur}
                      onChange={handleChange}
                      className={`${selectClass('demandeur')} pl-10 pr-8`}
                    >
                      <option value="" disabled>Sélectionner un demandeur</option>
                      {userOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}{name === currentUserFullName ? ' (Moi)' : ''}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-600 text-[16px]">expand_more</span>
                    </div>
                  </div>
                  <FieldError message={errors.demandeur} />
                </div>

              </div>

              {/* Emplacement (disabled) */}
              <div className="border-t border-border-dark pt-6 flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Emplacement
                </label>
                <input
                  type="text"
                  value={EMPLACEMENT_DEFAULT}
                  disabled
                  className="w-full bg-surface-lighter border border-border-dark rounded px-3 py-2.5 text-slate-500 text-sm cursor-not-allowed lg:w-1/2"
                />
                <p className="text-[11px] text-slate-600">Valeur fixe, non modifiable.</p>
              </div>

              {/* Remarque */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider" htmlFor="remarque">
                  Remarque <span className="text-slate-600 normal-case font-normal">(optionnel)</span>
                </label>
                <textarea
                  id="remarque"
                  name="remarque"
                  value={form.remarque}
                  onChange={handleChange}
                  placeholder="Instructions spécifiques, dépendances, procédures de rollback..."
                  rows={4}
                  className="w-full bg-input-bg border border-border-dark rounded px-3 py-3 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-slate-600 resize-y"
                />
              </div>
            </form>
          </div>

          <div className="bg-bg-dark px-6 py-3 border-t border-border-dark flex justify-between items-center text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Système en ligne
            </div>
            <span>Les champs marqués <span className="text-red-500">*</span> sont obligatoires</span>
          </div>
        </div>
      </div>
    </div>
  )
}
