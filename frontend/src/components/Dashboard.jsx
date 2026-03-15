import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.15.72:8000';
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const StatCard = ({ label, value, color = 'slate', sub }) => {
  const colorMap = {
    slate: 'text-slate-800',
    emerald: 'text-emerald-600',
    indigo: 'text-indigo-600',
    amber: 'text-amber-600',
    rose: 'text-rose-600',
    cyan: 'text-cyan-600',
  };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-1 hover:shadow-md transition-shadow">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
      <span className={`text-2xl font-bold ${colorMap[color] || 'text-slate-800'}`}>{value}</span>
      {sub && <span className="text-xs text-slate-400">{sub}</span>}
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    cards: {
      total_produtos: 0, total_lotes: 0, total_clientes: 0,
      total_fornecedores: 0, total_pedidos_compra: 0, total_pedidos_venda: 0,
      total_vendas: 0, saldo_caixa: 0, total_despesas: 0,
      valor_estoque: 0, contratos_ativos: 0, compras_pendentes: 0, saldo_contabil: 0
    },
    serie_temporal: [],
    chart_data: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/v1/dashboard/stats`)
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fmt = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
    </div>
  );

  return (
    <div className="fade-in space-y-8">

      {/* Cards Row 1 — Financeiro */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Financeiro</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total de Vendas" value={fmt(stats.cards.total_vendas)} color="emerald" sub="Contas a Receber" />
          <StatCard label="Total de Despesas" value={fmt(stats.cards.total_despesas)} color="rose" sub="Contas a Pagar" />
          <StatCard label="Saldo em Caixa" value={fmt(stats.cards.saldo_caixa)} color={stats.cards.saldo_caixa >= 0 ? 'emerald' : 'rose'} sub="Receitas − Despesas" />
        </div>
      </div>

      {/* Cards Row 2 — Operacional */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Operacional</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Produtos" value={stats.cards.total_produtos} color="indigo" />
          <StatCard label="Lotes WMS" value={stats.cards.total_lotes} color="cyan" />
          <StatCard label="Clientes" value={stats.cards.total_clientes} color="emerald" />
          <StatCard label="Fornecedores" value={stats.cards.total_fornecedores} color="amber" />
          <StatCard label="OCs" value={stats.cards.total_pedidos_compra} color="slate" />
          <StatCard label="Vendas" value={stats.cards.total_pedidos_venda} color="indigo" />
        </div>
      </div>

      {/* Cards Row 3 — Fase 6 (Enterprise) */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Enterprise (Fase 6)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Valor em Estoque" value={fmt(stats.cards.valor_estoque)} color="amber" sub="Custo Total NF Entradas" />
          <StatCard label="Contratos Ativos" value={stats.cards.contratos_ativos} color="indigo" sub="Gestão de Contratos" />
          <StatCard label="Compras Pendentes" value={stats.cards.compras_pendentes} color="rose" sub="Solicitações em Aberto" />
          <StatCard label="Saldo Contábil" value={fmt(stats.cards.saldo_contabil)} color="cyan" sub="Débitos − Créditos" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Area Chart — 7 dias */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-700 mb-4">Receitas vs Despesas — 7 dias</h3>
          {stats.serie_temporal.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 italic text-sm">Sem dados financeiros ainda.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.serie_temporal} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  formatter={(v) => [`R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, undefined]}
                />
                <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#10b981" strokeWidth={2} fill="url(#colorReceitas)" />
                <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#ef4444" strokeWidth={2} fill="url(#colorDespesas)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart — Estoque */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-700 mb-4">Estoque por Produto</h3>
          {stats.chart_data.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 italic text-sm">Nenhum lote no WMS.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.chart_data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {stats.chart_data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
