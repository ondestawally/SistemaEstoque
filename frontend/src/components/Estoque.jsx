import { api } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const STATUS_BADGE = {
  ENTRADA: 'bg-emerald-100 text-emerald-700',
  SAIDA: 'bg-rose-100 text-rose-700',
  INVENTARIO: 'bg-blue-100 text-blue-700',
  A: 'bg-emerald-500 text-white',
  B: 'bg-amber-500 text-white',
  C: 'bg-slate-400 text-white',
};

export default function Estoque({ setToast }) {
  const [activeTab, setActiveTab] = useState('posicao');
  const [posicao, setPosicao] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [curvaABC, setCurvaABC] = useState([]);
  const [ajustes, setAjustes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [historicoPrecos, setHistoricoPrecos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [showAjuste, setShowAjuste] = useState(false);
  const [loading, setLoading] = useState(false);

  const [ajusteForm, setAjusteForm] = useState({
    produto_id: '', tipo: 'ENTRADA', quantidade: '', custo_unitario: '', motivo: '', usuario: ''
  });

  const load = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'posicao') { const d = await api.getPosicaoEstoque(); setPosicao(d); }
      if (tab === 'abc') { const d = await api.getCurvaABCLogistica(); setCurvaABC(d); }
      if (tab === 'alertas') { const d = await api.getEstoqueCritico(); setAlertas(d); }
      if (tab === 'ajustes') {
        const [d, p] = await Promise.all([api.getAjustesEstoque(), api.getProdutos()]);
        setAjustes(d); setProdutos(p);
      }
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
    setLoading(false);
  };

  const handleTab = (t) => { setActiveTab(t); };

  const verPrecos = async (prodId) => {
    try {
      const d = await api.getHistoricoPrecos(prodId);
      setHistoricoPrecos(d);
      setProdutoSelecionado(prodId);
    } catch (e) { setToast?.({ type: 'error', msg: 'Erro ao carregar histórico' }); }
  };

  const submitAjuste = async (e) => {
    e.preventDefault();
    try {
      await api.lancarAjuste({
        id: `AJ-${Date.now()}`,
        produto_id: ajusteForm.produto_id,
        tipo: ajusteForm.tipo,
        quantidade: parseFloat(ajusteForm.quantidade),
        custo_unitario: parseFloat(ajusteForm.custo_unitario) || 0,
        motivo: ajusteForm.motivo,
        usuario: ajusteForm.usuario || 'sistema',
      });
      setToast?.({ type: 'success', msg: 'Ajuste lançado com sucesso!' });
      setShowAjuste(false);
      setAjusteForm({ produto_id: '', tipo: 'ENTRADA', quantidade: '', custo_unitario: '', motivo: '', usuario: '' });
      if (activeTab === 'ajustes') load('ajustes');
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const tabs = [
    { id: 'posicao', label: '📊 Posição' },
    { id: 'alertas', label: '🚨 Alertas' },
    { id: 'abc', label: '📈 Curva ABC' },
    { id: 'ajustes', label: '🔧 Ajustes' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Estoque e Custos</h2>
          <p className="text-slate-500 text-sm mt-1">Custo Médio Móvel · Curva ABC · Alertas · Ajustes</p>
        </div>
        <button
          onClick={() => setShowAjuste(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-sm"
        >+ Ajuste de Estoque</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-0">
        {tabs.map(t => (
          <button key={t.id} onClick={() => handleTab(t.id)}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${activeTab === t.id ? 'bg-white border border-b-white border-slate-200 text-brand-600 -mb-px' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-8 text-slate-400">Carregando...</div>}

      {/* POSIÇÃO */}
      {activeTab === 'posicao' && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Produto', 'Quantidade', 'Custo Médio', 'Valor Total', 'Mín.', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posicao.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Nenhum produto encontrado</td></tr>}
              {posicao.map(p => (
                <tr key={p.produto_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.produto_nome}</td>
                  <td className="px-4 py-3">{p.quantidade.toFixed(2)}</td>
                  <td className="px-4 py-3">R$ {p.custo_medio.toFixed(2)}</td>
                  <td className="px-4 py-3 font-semibold">R$ {p.valor_total.toFixed(2)}</td>
                  <td className="px-4 py-3">{p.estoque_minimo}</td>
                  <td className="px-4 py-3">
                    {p.alerta_minimo
                      ? <span className="px-2 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">⚠ Abaixo do Mínimo</span>
                      : <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">✓ OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ALERTAS CRÍTICOS */}
      {activeTab === 'alertas' && !loading && (
        <div className="space-y-4">
          {alertas.length === 0
            ? <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center text-emerald-700 font-medium">✔ Estoque saudável! Nenhum item em nível crítico.</div>
            : alertas.map(a => (
              <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-brand-500 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${a.nivel === 'CRITICO' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                    <span className="text-xl">{a.nivel === 'CRITICO' ? '🚫' : '⚠️'}</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{a.nome}</p>
                    <p className="text-sm text-slate-500">
                      Atual: <span className="font-bold">{a.estoque_atual}</span> | 
                      Ponto Pedido: <span className="font-bold">{a.ponto_pedido}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${a.nivel === 'CRITICO' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}`}>
                    {a.nivel}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Reposição Sugerida</p>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* CURVA ABC */}
      {activeTab === 'abc' && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['#', 'Produto', 'Valor Estoque', 'Acumulado', 'Classificação'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {curvaABC.map((p, i) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{p.nome}</td>
                  <td className="px-4 py-3 font-semibold">R$ {p.valor_estoque.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-500">{p.percent_acumulado.toFixed(1)}%</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            p.classe === 'A' ? 'bg-emerald-500 text-white' : 
                            p.classe === 'B' ? 'bg-amber-500 text-white' : 
                            'bg-slate-400 text-white'
                        }`}>
                            Classe {p.classe}
                        </span>
                        <button onClick={() => verPrecos(p.id)} className="text-brand-600 font-bold text-xs hover:underline">
                            Histórico →
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Seção de Histórico de Preços */}
          {produtoSelecionado && (
            <div className="p-6 bg-slate-50 border-t border-slate-200 fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-slate-800">Histórico de Preços: {produtoSelecionado}</h4>
                    <button onClick={() => setProdutoSelecionado(null)} className="text-slate-400 hover:text-slate-600">✕ Fechar</button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-4 rounded-2xl h-64 border border-slate-100 shadow-sm">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={historicoPrecos}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="data" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="preco" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 overflow-y-auto max-h-64 shadow-sm text-xs">
                        <table className="w-full">
                            <thead className="text-slate-400 text-left border-b border-slate-50">
                                <tr>
                                    <th className="pb-2">Data</th>
                                    <th className="pb-2">Fornec.</th>
                                    <th className="pb-2">Preço</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historicoPrecos.map((h, i) => (
                                    <tr key={i} className="border-b border-slate-50">
                                        <td className="py-2 text-slate-500">{h.data}</td>
                                        <td className="py-2 font-medium">{h.fornecedor}</td>
                                        <td className="py-2 font-bold text-emerald-600">R$ {h.preco}</td>
                                    </tr>
                                ))}
                                {historicoPrecos.length === 0 && (
                                    <tr><td colSpan={3} className="py-8 text-center text-slate-400 italic">Sem registros de NF-e</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
          )}
        </div>
      )}

      {/* AJUSTES */}
      {activeTab === 'ajustes' && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Produto', 'Tipo', 'Quantidade', 'Custo Unit.', 'Motivo', 'Usuário', 'Data'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ajustes.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">Nenhum ajuste registrado</td></tr>}
              {ajustes.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">{a.produto_id}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_BADGE[a.tipo] || 'bg-slate-100 text-slate-600'}`}>{a.tipo}</span></td>
                  <td className="px-4 py-3">{a.quantidade}</td>
                  <td className="px-4 py-3">R$ {a.custo_unitario}</td>
                  <td className="px-4 py-3">{a.motivo}</td>
                  <td className="px-4 py-3">{a.usuario}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{a.data_ajuste?.slice(0, 16)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Ajuste */}
      {showAjuste && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Ajuste de Estoque</h3>
            <form onSubmit={submitAjuste} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Produto</label>
                <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={ajusteForm.produto_id} onChange={e => setAjusteForm(f => ({ ...f, produto_id: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={ajusteForm.tipo} onChange={e => setAjusteForm(f => ({ ...f, tipo: e.target.value }))}>
                    <option value="ENTRADA">ENTRADA</option>
                    <option value="SAIDA">SAÍDA</option>
                    <option value="INVENTARIO">INVENTÁRIO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade</label>
                  <input required type="number" min="0" step="0.01" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={ajusteForm.quantidade} onChange={e => setAjusteForm(f => ({ ...f, quantidade: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Custo Unitário (R$)</label>
                <input type="number" min="0" step="0.01" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={ajusteForm.custo_unitario} onChange={e => setAjusteForm(f => ({ ...f, custo_unitario: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Motivo</label>
                <input required type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={ajusteForm.motivo} onChange={e => setAjusteForm(f => ({ ...f, motivo: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Usuário</label>
                <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={ajusteForm.usuario} onChange={e => setAjusteForm(f => ({ ...f, usuario: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAjuste(false)}
                  className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-xl font-medium hover:bg-slate-50 transition-all">Cancelar</button>
                <button type="submit"
                  className="flex-1 bg-brand-600 text-white py-2 rounded-xl font-medium hover:bg-brand-700 transition-all">Lançar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
