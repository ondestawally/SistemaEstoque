import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

const STATUS_COLORS = {
  ATIVO: 'bg-emerald-100 text-emerald-700',
  FERIAS: 'bg-blue-100 text-blue-700',
  AFASTADO: 'bg-amber-100 text-amber-700',
  DEMITIDO: 'bg-rose-100 text-rose-700',
};

const NIVEL_COLORS = {
  JUNIOR: 'bg-slate-100 text-slate-600',
  PLENO: 'bg-cyan-100 text-cyan-700',
  SENIOR: 'bg-violet-100 text-violet-700',
  ESPECIALISTA: 'bg-indigo-100 text-indigo-700',
  COORDENADOR: 'bg-amber-100 text-amber-700',
  GERENTE: 'bg-orange-100 text-orange-700',
  DIRETOR: 'bg-rose-100 text-rose-700',
};

const avatarInitials = (nome) => nome ? nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '??';

const avatarBg = ['bg-violet-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'];
const avatarColor = (id) => avatarBg[id?.charCodeAt(0) % avatarBg.length] || avatarBg[0];

export default function RH({ setToast }) {
  const [activeTab, setActiveTab] = useState('funcionarios');
  const [funcionarios, setFuncionarios] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [folhas, setFolhas] = useState([]);
  const [pontos, setPontos] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showFuncionario, setShowFuncionario] = useState(false);
  const [showCargo, setShowCargo] = useState(false);
  const [showFolha, setShowFolha] = useState(false);
  const [showPonto, setShowPonto] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const mesMes = new Date().getMonth() + 1;
  const ano = new Date().getFullYear();

  const [funcForm, setFuncForm] = useState({ id: '', nome: '', cpf: '', cargo_id: '', data_admissao: today, email: '', telefone: '', num_dependentes: 0, salario_atual: '' });
  const [cargoForm, setCargoForm] = useState({ id: '', nome: '', nivel: 'PLENO', salario_base: '', descricao: '' });
  const [folhaForm, setFolhaForm] = useState({ id: '', mes: mesMes, ano, funcionario_id: '', outros_descontos: 0, outros_acrescimos: 0, observacao: '' });
  const [pontoForm, setPontoForm] = useState({ id: '', funcionario_id: '', data: today, entrada: '08:00', saida: '17:00', observacao: '' });
  const [filtFolhaMes, setFiltFolhaMes] = useState(mesMes);
  const [filtFolhaAno, setFiltFolhaAno] = useState(ano);
  const [filtPontoFunc, setFiltPontoFunc] = useState('');

  const load = async (tab) => {
    setLoading(true);
    try {
      const [c, r] = await Promise.all([api.getCargos(), api.getRHResumo()]);
      setCargos(c); setResumo(r);
      if (tab === 'funcionarios') setFuncionarios(await api.getFuncionarios());
      if (tab === 'folha') setFolhas(await api.getFolha(filtFolhaMes, filtFolhaAno));
      if (tab === 'ponto') setPontos(await api.getPonto(filtPontoFunc));
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
    setLoading(false);
  };

  useEffect(() => { load(activeTab); }, [activeTab]);

  const submitFuncionario = async (e) => {
    e.preventDefault();
    try {
      await api.criarFuncionario({ ...funcForm, id: `FUNC-${Date.now()}`, num_dependentes: parseInt(funcForm.num_dependentes), salario_atual: funcForm.salario_atual ? parseFloat(funcForm.salario_atual) : null });
      setToast?.({ type: 'success', msg: 'Funcionário cadastrado!' });
      setShowFuncionario(false);
      setFuncionarios(await api.getFuncionarios());
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const submitCargo = async (e) => {
    e.preventDefault();
    try {
      await api.criarCargo({ ...cargoForm, id: `CRG-${Date.now()}`, salario_base: parseFloat(cargoForm.salario_base) });
      setToast?.({ type: 'success', msg: 'Cargo criado!' });
      setShowCargo(false);
      setCargos(await api.getCargos());
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const submitFolha = async (e) => {
    e.preventDefault();
    try {
      const result = await api.gerarFolha({ ...folhaForm, id: `FOLHA-${Date.now()}`, mes: parseInt(folhaForm.mes), ano: parseInt(folhaForm.ano), outros_descontos: parseFloat(folhaForm.outros_descontos), outros_acrescimos: parseFloat(folhaForm.outros_acrescimos) });
      setToast?.({ type: 'success', msg: `Folha gerada — Líquido: R$ ${result.salario_liquido?.toFixed(2)}` });
      setShowFolha(false);
      setFolhas(await api.getFolha(filtFolhaMes, filtFolhaAno));
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const submitPonto = async (e) => {
    e.preventDefault();
    try {
      await api.registrarPonto({ ...pontoForm, id: `PT-${Date.now()}` });
      setToast?.({ type: 'success', msg: 'Ponto registrado!' });
      setShowPonto(false);
      setPontos(await api.getPonto(filtPontoFunc));
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const atualizarStatus = async (id, status) => {
    try {
      await api.atualizarStatusFuncionario(id, status);
      setToast?.({ type: 'success', msg: `Status → ${status}` });
      setFuncionarios(await api.getFuncionarios());
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const MES_NAMES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const tabs = [
    { id: 'funcionarios', label: '👥 Funcionários' },
    { id: 'cargos', label: '🏷 Cargos' },
    { id: 'folha', label: '💰 Folha de Pagamento' },
    { id: 'ponto', label: '🕐 Ponto' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">RH — Recursos Humanos</h2>
          <p className="text-slate-500 text-sm mt-1">Funcionários · Cargos · Folha de Pagamento · Ponto</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'funcionarios' && <button onClick={() => setShowFuncionario(true)} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700 shadow-sm text-sm">+ Funcionário</button>}
          {activeTab === 'cargos' && <button onClick={() => setShowCargo(true)} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700 shadow-sm text-sm">+ Cargo</button>}
          {activeTab === 'folha' && <button onClick={() => setShowFolha(true)} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700 shadow-sm text-sm">+ Gerar Folha</button>}
          {activeTab === 'ponto' && <button onClick={() => setShowPonto(true)} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700 shadow-sm text-sm">+ Ponto</button>}
        </div>
      </div>

      {/* KPI Cards */}
      {resumo && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Funcionários', value: resumo.total_funcionarios, icon: '👥', color: 'text-slate-700' },
            { label: 'Ativos', value: resumo.ativos, icon: '✅', color: 'text-emerald-600' },
            { label: 'Em Férias', value: resumo.em_ferias, icon: '🏖', color: 'text-blue-600' },
            { label: 'Massa Salarial/Mês', value: `R$ ${parseFloat(resumo.massa_salarial_liquida_mes || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: '💰', color: 'text-violet-600' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${activeTab === t.id ? 'bg-white border border-b-white border-slate-200 text-brand-600 -mb-px' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-8 text-slate-400">Carregando...</div>}

      {/* FUNCIONÁRIOS */}
      {activeTab === 'funcionarios' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {funcionarios.length === 0 && <div className="col-span-3 bg-slate-50 border rounded-2xl p-8 text-center text-slate-400">Nenhum funcionário cadastrado</div>}
          {funcionarios.map(f => (
            <div key={f.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full ${avatarColor(f.id)} text-white flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                  {avatarInitials(f.nome)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{f.nome}</p>
                  <p className="text-xs text-slate-500">{f.cpf}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${STATUS_COLORS[f.status] || ''}`}>{f.status}</span>
              </div>
              <div className="text-sm text-slate-600 space-y-1">
                <p>🏷 Cargo: <span className="font-medium">{cargos.find(c => c.id === f.cargo_id)?.nome || f.cargo_id}</span></p>
                {f.salario_atual && <p>💰 Salário: <span className="font-medium">R$ {parseFloat(f.salario_atual).toFixed(2)}</span></p>}
                <p>📅 Admissão: <span className="font-medium">{f.data_admissao}</span></p>
                {f.email && <p>📧 {f.email}</p>}
              </div>
              {f.status === 'ATIVO' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => atualizarStatus(f.id, 'FERIAS')} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-100 flex-1">Férias</button>
                  <button onClick={() => atualizarStatus(f.id, 'AFASTADO')} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg hover:bg-amber-100 flex-1">Afastar</button>
                  <button onClick={() => atualizarStatus(f.id, 'DEMITIDO')} className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1 rounded-lg hover:bg-rose-100 flex-1">Demitir</button>
                </div>
              )}
              {f.status !== 'ATIVO' && <button onClick={() => atualizarStatus(f.id, 'ATIVO')} className="w-full mt-2 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-100">Reativar</button>}
            </div>
          ))}
        </div>
      )}

      {/* CARGOS */}
      {activeTab === 'cargos' && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>{['Cargo', 'Nível', 'Salário Base', 'Descrição'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargos.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Nenhum cargo cadastrado</td></tr>}
              {cargos.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{c.nome}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${NIVEL_COLORS[c.nivel] || ''}`}>{c.nivel}</span></td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">R$ {parseFloat(c.salario_base).toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{c.descricao || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FOLHA */}
      {activeTab === 'folha' && !loading && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center flex-wrap">
            <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={filtFolhaMes} onChange={e => setFiltFolhaMes(parseInt(e.target.value))}>
              {MES_NAMES.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <input type="number" className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-24" value={filtFolhaAno} onChange={e => setFiltFolhaAno(parseInt(e.target.value))} />
            <button onClick={async () => { setLoading(true); setFolhas(await api.getFolha(filtFolhaMes, filtFolhaAno)); setLoading(false); }} className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-brand-700">Filtrar</button>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{['Funcionário', 'Período', 'Bruto', 'INSS', 'IRRF', 'Líquido'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {folhas.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Nenhuma folha no período</td></tr>}
                {folhas.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{funcionarios.find(fn => fn.id === f.funcionario_id)?.nome || f.funcionario_id}</td>
                    <td className="px-4 py-3">{MES_NAMES[f.mes]}/{f.ano}</td>
                    <td className="px-4 py-3">R$ {parseFloat(f.salario_bruto).toFixed(2)}</td>
                    <td className="px-4 py-3 text-rose-600">-R$ {parseFloat(f.desconto_inss).toFixed(2)}</td>
                    <td className="px-4 py-3 text-rose-600">-R$ {parseFloat(f.desconto_irrf).toFixed(2)}</td>
                    <td className="px-4 py-3 font-bold text-emerald-700">R$ {parseFloat(f.salario_liquido).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PONTO */}
      {activeTab === 'ponto' && !loading && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={filtPontoFunc} onChange={async e => { setFiltPontoFunc(e.target.value); setLoading(true); setPontos(await api.getPonto(e.target.value)); setLoading(false); }}>
              <option value="">Todos os funcionários</option>
              {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{['Funcionário', 'Data', 'Entrada', 'Saída', 'Horas', 'Obs'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pontos.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Nenhum registro</td></tr>}
                {pontos.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{funcionarios.find(f => f.id === p.funcionario_id)?.nome || p.funcionario_id}</td>
                    <td className="px-4 py-3">{p.data}</td>
                    <td className="px-4 py-3 font-mono text-emerald-600">{p.entrada || '—'}</td>
                    <td className="px-4 py-3 font-mono text-rose-500">{p.saida || '—'}</td>
                    <td className="px-4 py-3 font-bold">{p.horas_trabalhadas != null ? `${p.horas_trabalhadas}h` : '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{p.observacao || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Funcionário */}
      {showFuncionario && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Novo Funcionário</h3>
            <form onSubmit={submitFuncionario} className="space-y-3">
              <input required placeholder="Nome Completo" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={funcForm.nome} onChange={e => setFuncForm(f => ({ ...f, nome: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="CPF (000.000.000-00)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={funcForm.cpf} onChange={e => setFuncForm(f => ({ ...f, cpf: e.target.value }))} />
                <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={funcForm.cargo_id} onChange={e => setFuncForm(f => ({ ...f, cargo_id: e.target.value }))}>
                  <option value="">Cargo...</option>
                  {cargos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-slate-500 mb-1 block">Data de Admissão</label>
                  <input required type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={funcForm.data_admissao} onChange={e => setFuncForm(f => ({ ...f, data_admissao: e.target.value }))} />
                </div>
                <div><label className="text-xs text-slate-500 mb-1 block">Salário (override)</label>
                  <input type="number" step="0.01" min="0" placeholder="Opcional" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={funcForm.salario_atual} onChange={e => setFuncForm(f => ({ ...f, salario_atual: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="E-mail" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={funcForm.email} onChange={e => setFuncForm(f => ({ ...f, email: e.target.value }))} />
                <input placeholder="Telefone" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={funcForm.telefone} onChange={e => setFuncForm(f => ({ ...f, telefone: e.target.value }))} />
              </div>
              <div><label className="text-xs text-slate-500 mb-1 block">Nº Dependentes (IRRF)</label>
                <input type="number" min="0" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={funcForm.num_dependentes} onChange={e => setFuncForm(f => ({ ...f, num_dependentes: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowFuncionario(false)} className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-xl font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-brand-600 text-white py-2 rounded-xl font-medium hover:bg-brand-700">Cadastrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cargo */}
      {showCargo && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Novo Cargo</h3>
            <form onSubmit={submitCargo} className="space-y-3">
              <input required placeholder="Nome do Cargo" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={cargoForm.nome} onChange={e => setCargoForm(f => ({ ...f, nome: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={cargoForm.nivel} onChange={e => setCargoForm(f => ({ ...f, nivel: e.target.value }))}>
                  {['JUNIOR','PLENO','SENIOR','ESPECIALISTA','COORDENADOR','GERENTE','DIRETOR'].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <input required type="number" step="0.01" min="0" placeholder="Salário Base R$" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={cargoForm.salario_base} onChange={e => setCargoForm(f => ({ ...f, salario_base: e.target.value }))} />
              </div>
              <input placeholder="Descrição (opcional)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={cargoForm.descricao} onChange={e => setCargoForm(f => ({ ...f, descricao: e.target.value }))} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCargo(false)} className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-xl font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-brand-600 text-white py-2 rounded-xl font-medium hover:bg-brand-700">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Folha */}
      {showFolha && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Gerar Folha de Pagamento</h3>
            <form onSubmit={submitFolha} className="space-y-3">
              <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={folhaForm.funcionario_id} onChange={e => setFolhaForm(f => ({ ...f, funcionario_id: e.target.value }))}>
                <option value="">Funcionário...</option>
                {funcionarios.filter(fn => fn.status === 'ATIVO').map(fn => <option key={fn.id} value={fn.id}>{fn.nome}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-slate-500 mb-1 block">Mês</label>
                  <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={folhaForm.mes} onChange={e => setFolhaForm(f => ({ ...f, mes: e.target.value }))}>
                    {MES_NAMES.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-slate-500 mb-1 block">Ano</label>
                  <input type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={folhaForm.ano} onChange={e => setFolhaForm(f => ({ ...f, ano: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-slate-500 mb-1 block">Outros Descontos R$</label>
                  <input type="number" step="0.01" min="0" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={folhaForm.outros_descontos} onChange={e => setFolhaForm(f => ({ ...f, outros_descontos: e.target.value }))} />
                </div>
                <div><label className="text-xs text-slate-500 mb-1 block">Outros Acréscimos R$</label>
                  <input type="number" step="0.01" min="0" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={folhaForm.outros_acrescimos} onChange={e => setFolhaForm(f => ({ ...f, outros_acrescimos: e.target.value }))} />
                </div>
              </div>
              <input placeholder="Observação" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={folhaForm.observacao} onChange={e => setFolhaForm(f => ({ ...f, observacao: e.target.value }))} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowFolha(false)} className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-xl font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-brand-600 text-white py-2 rounded-xl font-medium hover:bg-brand-700">Gerar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ponto */}
      {showPonto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Registrar Ponto</h3>
            <form onSubmit={submitPonto} className="space-y-3">
              <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={pontoForm.funcionario_id} onChange={e => setPontoForm(f => ({ ...f, funcionario_id: e.target.value }))}>
                <option value="">Funcionário...</option>
                {funcionarios.filter(fn => fn.status === 'ATIVO').map(fn => <option key={fn.id} value={fn.id}>{fn.nome}</option>)}
              </select>
              <input required type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={pontoForm.data} onChange={e => setPontoForm(f => ({ ...f, data: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-slate-500 mb-1 block">Entrada</label>
                  <input type="time" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={pontoForm.entrada} onChange={e => setPontoForm(f => ({ ...f, entrada: e.target.value }))} />
                </div>
                <div><label className="text-xs text-slate-500 mb-1 block">Saída</label>
                  <input type="time" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={pontoForm.saida} onChange={e => setPontoForm(f => ({ ...f, saida: e.target.value }))} />
                </div>
              </div>
              <input placeholder="Observação" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={pontoForm.observacao} onChange={e => setPontoForm(f => ({ ...f, observacao: e.target.value }))} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPonto(false)} className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-xl font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-brand-600 text-white py-2 rounded-xl font-medium hover:bg-brand-700">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
