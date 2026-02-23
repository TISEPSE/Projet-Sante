import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import * as api from './services/api'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import OTList from './pages/OTList'
import OTDetail from './pages/OTDetail'
import OTForm from './pages/OTForm'

function Layout({ children, user }) {
  return (
    <div className="flex h-screen bg-bg-dark overflow-hidden">
      <Sidebar user={user} />
      <div className="ml-64 flex-1 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [ots, setOTs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isLoggedIn = !!user

  // Restore session on mount
  useEffect(() => {
    const token = api.getToken()
    if (!token) {
      setLoading(false)
      return
    }
    api.getMe()
      .then((u) => setUser(u))
      .catch(() => api.logout())
      .finally(() => setLoading(false))
  }, [])

  // Load OTs when logged in
  useEffect(() => {
    if (!isLoggedIn) return
    api.fetchOTs()
      .then(setOTs)
      .catch((err) => setError(err.message))
  }, [isLoggedIn])

  const handleLogin = useCallback((userData) => {
    setUser(userData)
  }, [])

  const handleLogout = useCallback(() => {
    api.logout()
    setUser(null)
    setOTs([])
  }, [])

  const handleValidateMEP = useCallback(async (id) => {
    try {
      const updated = await api.validateMEP(id)
      setOTs((prev) => prev.map((ot) => (ot.id === id ? updated : ot)))
    } catch (err) {
      setError(err.message)
    }
  }, [])

  const handleCancelMEP = useCallback(async (id) => {
    try {
      const updated = await api.cancelMEP(id)
      setOTs((prev) => prev.map((ot) => (ot.id === id ? updated : ot)))
    } catch (err) {
      setError(err.message)
    }
  }, [])

  const handleDelete = useCallback(async (id) => {
    try {
      await api.deleteOT(id)
      setOTs((prev) => prev.filter((ot) => ot.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }, [])

  const handleSave = useCallback(async (formData, editId) => {
    try {
      if (editId) {
        const updated = await api.updateOT(editId, formData)
        setOTs((prev) => prev.map((ot) => (ot.id === editId ? updated : ot)))
        return editId
      } else {
        const created = await api.createOT(formData)
        setOTs((prev) => [created, ...prev])
        return created.id
      }
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-dark text-slate-400">
        Chargement...
      </div>
    )
  }

  return (
    <BrowserRouter>
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500/90 text-white text-sm px-4 py-2 rounded shadow-lg">
          {error}
          <button className="ml-3 font-bold" onClick={() => setError(null)}>✕</button>
        </div>
      )}
      <Routes>
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Layout user={user}>
                <OTList ots={ots} />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/ot/new"
          element={
            isLoggedIn ? (
              <Layout user={user}>
                <OTForm ots={ots} onSave={handleSave} />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/ot/:id"
          element={
            isLoggedIn ? (
              <Layout user={user}>
                <OTDetail
                  ots={ots}
                  onValidateMEP={handleValidateMEP}
                  onCancelMEP={handleCancelMEP}
                  onDelete={handleDelete}
                  currentUser={user}
                />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/ot/:id/edit"
          element={
            isLoggedIn ? (
              <Layout user={user}>
                <OTForm ots={ots} onSave={handleSave} />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
