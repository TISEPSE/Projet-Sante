export default function StatusBadge({ mepEffectuee }) {
  if (mepEffectuee) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        MEP Effectuée
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-700/30 text-slate-400 border border-slate-600/30">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
      En attente
    </span>
  )
}
