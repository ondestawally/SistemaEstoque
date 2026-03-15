import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('erp_token');
        const headers = { 'Authorization': `Bearer ${token}` };
        const apiBase = import.meta.env.VITE_API_URL || 'http://192.168.15.72:8000';

        Promise.all([
            fetch(`${apiBase}/api/v1/analytics/vendas-vs-compras`, { headers }).then(r => r.json()),
            fetch(`${apiBase}/api/v1/analytics/distribuicao-financeira`, { headers }).then(r => r.json()),
            fetch(`${apiBase}/api/v1/analytics/principais-kpis`, { headers }).then(r => r.json())
        ]).then(([vvc, dist, kpis]) => {
            setData({ vvc, dist, kpis });
            setLoading(false);
        }).catch(err => {
            console.error("Erro ao carregar Analytics:", err);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="p-10 text-center animate-pulse text-slate-400">Processando Inteligência de Negócio...</div>;

    // Transformar dados para o gráfico de linha (mesclando vendas e compras)
    const lineData = data?.vvc?.vendas?.map(v => {
        const c = data.vvc.compras.find(compra => compra.mes === v.mes);
        return { mes: v.mes, vendas: v.valor, compras: c ? c.valor : 0 };
    }) || [];

    return (
        <div className="fade-in space-y-8 pb-12">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Valor Total Estoque', val: `R$ ${data?.kpis?.valor_estoque_total?.toLocaleString()}`, sub: 'Ativo Imobilizado', color: 'text-blue-600' },
                    { label: 'Giro de Estoque', val: `${data?.kpis?.giro_estoque_mensal}x`, sub: 'Taxa Mensal', color: 'text-emerald-600' },
                    { label: 'Margem Bruta Média', val: `${data?.kpis?.margem_lucro_media}%`, sub: 'Lucratividade', color: 'text-purple-600' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <p className="text-sm font-medium text-slate-500 mb-1">{kpi.label}</p>
                        <h3 className={`text-2xl font-bold ${kpi.color}`}>{kpi.val}</h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Vendas vs Compras */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h4 className="text-lg font-bold text-slate-800 mb-6">Equilíbrio: Vendas vs Compras</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="mes" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="top" height={36}/>
                                <Line type="monotone" dataKey="vendas" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Vendas" />
                                <Line type="monotone" dataKey="compras" stroke="#94a3b8" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} name="Compras" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribuição Financeira */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h4 className="text-lg font-bold text-slate-800 mb-6">Composição Financeira</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.dist || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="valor"
                                    nameKey="tipo"
                                >
                                    {data?.dist?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Simulated Heatmap Area */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl overflow-hidden relative">
                <div className="relative z-10">
                    <h4 className="text-xl font-bold mb-2">Performance em Tempo Real</h4>
                    <p className="text-slate-400 text-sm mb-6">Insights gerados automaticamente pelo motor de BI.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['Logística', 'Vendas', 'RH', 'Financeiro'].map(dept => (
                            <div key={dept} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                <p className="text-xs text-slate-400 mb-1">{dept}</p>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-500" style={{ width: `${Math.random() * 60 + 40}%` }}></div>
                                    </div>
                                    <span className="text-xs font-bold">OK</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 blur-[100px] -mr-32 -mt-32"></div>
            </div>
        </div>
    );
};

export default Analytics;
