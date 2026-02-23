export default function ConfirmModal({ title, message, confirmLabel, confirmClass, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-panel-dark border border-border-dark rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-slate-400">{message}</p>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 bg-bg-dark border-t border-border-dark">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border border-border-dark text-slate-300 hover:bg-surface-lighter text-sm font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded text-white text-sm font-bold transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
