import React, { useEffect, useState } from 'react';

const Expedicao = ({ setToast }) => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rastreioModal, setRastreioModal] = useState(null);
    const [codigoRastreio, setCodigoRastreio] = useState('');

    const fetchPendentes = () => {
        const token = localStorage.getItem('erp_token');
        const apiBase = import.meta.env.VITE_API_URL || 'http://192.168.15.72:8000';
        
        fetch(`${apiBase}/api/v1/logistica/expedicao/pendentes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(r => r.json())
        .then(data => {
            setPedidos(data);
            setLoading(false);
        })
        .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchPendentes();
    }, []);

    const avancarStatus = (id) => {
        const token = localStorage.getItem('erp_token');
        const apiBase = import.meta.env.VITE_API_URL || 'http://192.168.15.72:8000';

        fetch(`${apiBase}/api/v1/logistica/expedicao/${id}/avancar`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(r => {
            if (r.ok) {
                setToast({ type: 'success', msg: 'Fluxo logístico atualizado!' });
                fetchPendentes();
            }
        });
    };

    const finalizarDespacho = () => {
        const token = localStorage.getItem('erp_token');
        const apiBase = import.meta.env.VITE_API_URL || 'http://192.168.15.72:8000';

        fetch(`${apiBase}/api/v1/logistica/expedicao/${rastreioModal}/despachar`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ codigo_rastreio: codigoRastreio })
        })
        .then(r => {
            if (r.ok) {
                setToast({ type: 'success', msg: 'Pedido despachado com sucesso!' });
                setRastreioModal(null);
                setCodigoRastreio('');
                fetchPendentes();
            }
        });
    };

    if (loading) return <div className="p-10 text-center animate-pulse text-slate-400">Carregando fila de expedição...</div>;

    return (
        <div className="fade-in space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Fila de Expedição</h3>
                <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-xs font-bold">
                    {pedidos.length} PEDIDOS AGUARDANDO
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pedidos.map(p => (
                    <div key={p.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:border-brand-300 transition-colors">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">#{p.id}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    p.status_logistica === 'PENDENTE' ? 'bg-slate-100 text-slate-600' :
                                    p.status_logistica === 'PICKING' ? 'bg-blue-100 text-blue-600' :
                                    'bg-purple-100 text-purple-600'
                                }`}>
                                    {p.status_logistica}
                                </span>
                            </div>
                            <h4 className="font-bold text-slate-800 mb-1">{p.cliente}</h4>
                            <p className="text-xs text-slate-500 mb-3">Valor total: R$ {p.valor_total?.toLocaleString()}</p>
                        </div>

                        <div className="space-y-2 mt-4">
                            {p.status_logistica !== 'PACKING' ? (
                                <button 
                                    onClick={() => avancarStatus(p.id)}
                                    className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span>➔</span> {p.status_logistica === 'PENDENTE' ? 'Iniciar Picking' : 'Finalizar Picking'}
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setRastreioModal(p.id)}
                                    className="w-full py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20"
                                >
                                    <span>📦</span> Despachar Pedido
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {pedidos.length === 0 && (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                    <span className="text-4xl block mb-2">🚚</span>
                    Tudo limpo! Nenhum pedido pendente de envio.
                </div>
            )}

            {/* Modal de Rastreio */}
            {rastreioModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl fade-in">
                        <h4 className="text-lg font-bold text-slate-800 mb-4">Finalizar Despacho</h4>
                        <p className="text-sm text-slate-500 mb-4">Informe o código de rastreamento para o envio do pedido {rastreioModal}.</p>
                        
                        <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm mb-4 focus:ring-2 focus:ring-brand-500 outline-none"
                            placeholder="Ex: BR123456789XX"
                            value={codigoRastreio}
                            onChange={(e) => setCodigoRastreio(e.target.value)}
                        />

                        <div className="flex gap-2">
                            <button onClick={() => setRastreioModal(null)} className="flex-1 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
                            <button 
                                onClick={finalizarDespacho}
                                disabled={!codigoRastreio}
                                className="flex-1 py-2 bg-brand-600 text-white text-sm font-bold rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-all"
                            >
                                Confirmar Envio
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expedicao;
