import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../services/api'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const data = await login(email, password)
      onLogin(data.user)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Identifiants incorrects')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #22252b 1px, transparent 1px), linear-gradient(to bottom, #22252b 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[480px] bg-panel-dark rounded-lg shadow-2xl border border-border-dark overflow-hidden">
        {/* Header */}
        <div className="flex flex-col items-center pt-10 pb-6 px-8 text-center">
          <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-4xl">inventory_2</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Santé&amp;Cie OT Tracker</h2>
          <p className="text-slate-400 text-sm">Connectez-vous pour accéder aux ordres de transport SAP</p>
        </div>

        {/* Form */}
        <div className="px-8 pb-10 w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-300" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.fr"
                className="w-full h-12 rounded bg-input-bg border border-border-dark px-4 text-base text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-600 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-300" htmlFor="password">
                Mot de passe
              </label>
              <div className="relative flex w-full">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-12 rounded-l bg-input-bg border border-border-dark border-r-0 px-4 text-base text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center justify-center px-4 h-12 bg-input-bg border border-border-dark border-l-0 rounded-r text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full h-12 bg-primary hover:bg-blue-600 text-white font-semibold rounded shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>Se connecter</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>

            <p className="text-center text-sm text-slate-500">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-primary hover:text-blue-400 font-medium transition-colors">
                Créer un compte
              </Link>
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="py-4 px-8 bg-bg-dark border-t border-border-dark text-center">
          <p className="text-xs text-slate-500">Santé&amp;Cie OT Tracker • IT Operations</p>
        </div>
      </div>
    </div>
  )
}
