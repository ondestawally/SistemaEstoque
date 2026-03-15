import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const Auditoria = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Como ainda não criamos o endpoint de listagem de logs, vamos simular ou criar agora no auth_router
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/audit-logs`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('erp_token')}` }
    })
      .then(r => r.json())
      .then(data => { setLogs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center animate-pulse">Carregando trilha de auditoria...</div>;

  return (
    <div className="fade-in space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Data/Hora</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Usuário</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Ação</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Entidade</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400 italic">Nenhum log de auditoria encontrado.</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">{log.username}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-700' :
                      log.action === 'DELETE' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{log.entity} <span className="text-xs text-slate-400">#{log.entity_id}</span></td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono truncate max-w-xs">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Auditoria;
