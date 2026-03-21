import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

export function GlobalSearch({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ produtos: [], clientes: [], pedidos: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ produtos: [], clientes: [], pedidos: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
          const [produtos, clientes, pedidos] = await Promise.all([
          api.getProdutos().catch(() => []),
          api.getClientes().catch(() => []),
          api.getPedidosVenda().catch(() => [])
        ]);

        setResults({
          produtos: produtos.filter(p => 
            p.nome?.toLowerCase().includes(query.toLowerCase()) ||
            p.codigo_barras?.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 5),
          clientes: clientes.filter(c => 
            c.razao_social?.toLowerCase().includes(query.toLowerCase()) ||
            c.cnpj_cpf?.includes(query)
          ).slice(0, 5),
          pedidos: pedidos.filter(p => 
            p.id?.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 5)
        });
      } catch (e) {
        console.error('Search error:', e);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const totalResults = results.produtos.length + results.clientes.length + results.pedidos.length;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="flex-1 text-lg outline-none placeholder:text-slate-400"
              placeholder="Buscar produtos, clientes, pedidos..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <kbd className="px-2 py-1 text-xs bg-slate-100 text-slate-500 rounded">ESC</kbd>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center text-slate-500">
              <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Buscando...
            </div>
          )}

          {!loading && query.length >= 2 && totalResults === 0 && (
            <div className="p-8 text-center text-slate-500">
              <div className="text-3xl mb-2">🔍</div>
              Nenhum resultado encontrado
            </div>
          )}

          {!loading && results.produtos.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-1 text-xs text-slate-400 uppercase font-medium">Produtos</div>
              {results.produtos.map(p => (
                <button
                  key={p.id}
                  onClick={() => { onSelect({ type: 'produto', ...p }); onClose(); }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between rounded-lg"
                >
                  <span className="font-medium text-slate-700">{p.nome}</span>
                  <span className="text-xs text-slate-400">{p.codigo_barras}</span>
                </button>
              ))}
            </div>
          )}

          {!loading && results.clientes.length > 0 && (
            <div className="p-2 border-t border-slate-100">
              <div className="px-3 py-1 text-xs text-slate-400 uppercase font-medium">Clientes</div>
              {results.clientes.map(c => (
                <button
                  key={c.id}
                  onClick={() => { onSelect({ type: 'cliente', ...c }); onClose(); }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between rounded-lg"
                >
                  <span className="font-medium text-slate-700">{c.razao_social}</span>
                  <span className="text-xs text-slate-400">{c.cnpj_cpf}</span>
                </button>
              ))}
            </div>
          )}

          {!loading && results.pedidos.length > 0 && (
            <div className="p-2 border-t border-slate-100">
              <div className="px-3 py-1 text-xs text-slate-400 uppercase font-medium">Pedidos</div>
              {results.pedidos.map(p => (
                <button
                  key={p.id}
                  onClick={() => { onSelect({ type: 'pedido', ...p }); onClose(); }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between rounded-lg"
                >
                  <span className="font-medium text-slate-700">{p.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    p.status === 'APROVADO' ? 'bg-emerald-100 text-emerald-700' :
                    p.status === 'ORCAMENTO' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {p.status}
                  </span>
                </button>
              ))}
            </div>
          )}

          {!loading && query.length < 2 && (
            <div className="p-8 text-center text-slate-400 text-sm">
              Digite pelo menos 2 caracteres para buscar
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
          <span>↑↓ navegar</span>
          <span>↵ selecionar</span>
          <span>ESC fechar</span>
        </div>
      </div>
    </div>
  );
}

export function useGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isOpen, setIsOpen };
}