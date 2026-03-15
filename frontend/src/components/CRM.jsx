import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const ETAPAS = [
  { id: 'PROSPECCAO', label: 'Prospecção', color: 'bg-slate-100 text-slate-600' },
  { id: 'QUALIFICACAO', label: 'Qualificação', color: 'bg-blue-100 text-blue-600' },
  { id: 'PROPOSTA', label: 'Proposta', color: 'bg-amber-100 text-amber-600' },
  { id: 'NEGOCIACAO', label: 'Negociação', color: 'bg-brand-100 text-brand-600' },
  { id: 'FECHADO_GANHO', label: 'Ganho', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'FECHADO_PERDIDO', label: 'Perdido', color: 'bg-rose-100 text-rose-600' },
];

export default function CRM({ setToast }) {
  const [activeTab, setActiveTab] = useState('funil');
  const [leads, setLeads] = useState([]);
  const [oportunidades, setOportunidades] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showOpModal, setShowOpModal] = useState(false);

  const [leadForm, setLeadForm] = useState({ id: '', nome_contato: '', empresa: '', email: '', telefone: '', observacoes: '' });
  const [opForm, setOpForm] = useState({ id: '', lead_id: '', vendedor_id: '', titulo: '', valor_estimado: '', etapa: 'PROSPECCAO', data_fechamento_estimada: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [l, o, v] = await Promise.all([api.getLeads(), api.getOportunidades(), api.getVendedores()]);
      setLeads(l);
      setOportunidades(o);
      setVendedores(v);
    } catch (e) { setToast?.({ type: 'error', msg: 'Erro ao carregar dados' }); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submitLead = async (e) => {
    e.preventDefault();
    try {
      await api.criarLead({ ...leadForm, id: `LEAD-${Date.now()}` });
      setToast?.({ type: 'success', msg: 'Lead cadastrado!' });
      setShowLeadModal(false);
      load();
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const submitOp = async (e) => {
    e.preventDefault();
    try {
      await api.criarOportunidade({ ...opForm, id: `OP-${Date.now()}` });
      setToast?.({ type: 'success', msg: 'Oportunidade aberta!' });
      setShowOpModal(false);
      load();
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const avancar = async (id, nova) => {
    try {
      await api.avancarEtapaCRM(id, nova);
      load();
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">CRM & Vendas</h2>
          <p className="text-slate-500 text-sm mt-1">Gestão de Funil · Leads · Oportunidades</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowLeadModal(true)} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-50">+ Lead</button>
          <button onClick={() => setShowOpModal(true)} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl font-medium shadow-sm transition-all">+ Oportunidade</button>
        </div>
      </div>

      {/* Funil Visual */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {ETAPAS.map(etapa => (
          <div key={etapa.id} className="min-w-[200px] flex flex-col gap-3">
            <div className={`p-3 rounded-2xl font-bold text-center text-xs uppercase tracking-wider ${etapa.color}`}>
              {etapa.label} ({oportunidades.filter(o => o.etapa === etapa.id).length})
            </div>
            <div className="space-y-3">
              {oportunidades.filter(o => o.etapa === etapa.id).map(op => (
                <div key={op.id} className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <p className="font-bold text-slate-800 text-sm line-clamp-2">{op.titulo}</p>
                  <p className="text-brand-600 font-bold mt-2">R$ {op.valor.toLocaleString()}</p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50 text-[10px]">
                    <span className="text-slate-400">👤 {op.vendedor}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {ETAPAS.findIndex(e => e.id === op.etapa) < ETAPAS.length - 1 && (
                        <button onClick={() => avancar(op.id, ETAPAS[ETAPAS.findIndex(e => e.id === op.etapa) + 1].id)} className="bg-brand-50 text-brand-600 p-1 rounded">➡</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showLeadModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-300">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Novo Lead</h3>
                <form onSubmit={submitLead} className="space-y-4">
                    <input required placeholder="Nome do Contato" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" 
                        value={leadForm.nome_contato} onChange={e => setLeadForm({...leadForm, nome_contato: e.target.value})} />
                    <input placeholder="Empresa" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" 
                        value={leadForm.empresa} onChange={e => setLeadForm({...leadForm, empresa: e.target.value})} />
                    <div className="grid grid-cols-2 gap-3">
                        <input placeholder="E-mail" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" 
                            value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})} />
                        <input placeholder="Telefone" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" 
                            value={leadForm.telefone} onChange={e => setLeadForm({...leadForm, telefone: e.target.value})} />
                    </div>
                    <textarea placeholder="Observações" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm h-24" 
                        value={leadForm.observacoes} onChange={e => setLeadForm({...leadForm, observacoes: e.target.value})} />
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowLeadModal(false)} className="flex-1 bg-slate-50 text-slate-600 py-3 rounded-2xl font-bold">Cancelar</button>
                        <button type="submit" className="flex-1 bg-brand-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-brand-200">Salvar Lead</button>
                    </div>
                </form>
            </div>
          </div>
      )}

      {showOpModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-300">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Nova Oportunidade</h3>
                <form onSubmit={submitOp} className="space-y-4">
                    <input required placeholder="Título da Oportunidade" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" 
                        value={opForm.titulo} onChange={e => setOpForm({...opForm, titulo: e.target.value})} />
                    <select required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" 
                        value={opForm.lead_id} onChange={e => setOpForm({...opForm, lead_id: e.target.value})}>
                        <option value="">Selecione o Lead...</option>
                        {leads.map(l => <option key={l.id} value={l.id}>{l.nome_contato} ({l.empresa})</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-3">
                        <select required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" 
                            value={opForm.vendedor_id} onChange={e => setOpForm({...opForm, vendedor_id: e.target.value})}>
                            <option value="">Vendedor...</option>
                            {vendedores.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
                        </select>
                        <input required type="number" step="0.01" placeholder="Valor (R$)" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" 
                            value={opForm.valor_estimado} onChange={e => setOpForm({...opForm, valor_estimado: e.target.value})} />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowOpModal(false)} className="flex-1 bg-slate-50 text-slate-600 py-3 rounded-2xl font-bold">Cancelar</button>
                        <button type="submit" className="flex-1 bg-brand-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-brand-200">Abrir Deal</button>
                    </div>
                </form>
            </div>
          </div>
      )}
    </div>
  );
}
