const emptyIcons = {
  default: '📦',
  produto: '🏷️',
  cliente: '👥',
  pedido: '📋',
  venda: '💰',
  fornecedor: '🚚',
  estoque: '📊',
  relatorio: '📈',
};

export function EmptyState({ 
  title = "Nenhum dado encontrado", 
  message = "Não há registros para exibir.",
  actionLabel,
  onAction,
  type = 'default'
}) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
      <div className="text-5xl mb-4">{emptyIcons[type] || emptyIcons.default}</div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
      <p className="text-slate-500 mb-6 max-w-md mx-auto">{message}</p>
      {actionLabel && (
        <button 
          onClick={onAction}
          className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-all shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function EmptyTable({ message = "Nenhum registro encontrado", onClear }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
      <div className="text-4xl mb-3">🔍</div>
      <p className="text-slate-500">{message}</p>
      {onClear && (
        <button 
          onClick={onClear}
          className="mt-4 text-sm text-brand-600 hover:text-brand-700 font-medium"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}