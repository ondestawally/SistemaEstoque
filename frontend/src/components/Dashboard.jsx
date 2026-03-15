import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const [stats, setStats] = useState({
    cards: { total_produtos: 0, total_pedidos: 0, total_lotes: 0, health: '...' },
    chart_data: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${api.baseURL || 'http://localhost:8000'}/api/v1/dashboard/stats`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="fade-in space-y-8">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-500">Produtos</span>
              <span className="text-3xl font-bold text-slate-800">{stats.cards.total_produtos}</span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-2">
              <span className="text-sm font-medium text-emerald-600">Total Vendas</span>
              <span className="text-3xl font-bold text-emerald-700">R$ {stats.cards.total_vendas?.toLocaleString()}</span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-2">
              <span className="text-sm font-medium text-indigo-500">Lotes WMS</span>
              <span className="text-3xl font-bold text-indigo-600">{stats.cards.total_lotes}</span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-2">
              <span className="text-sm font-medium text-amber-500">Saldo em Caixa</span>
              <span className={`text-3xl font-bold ${stats.cards.saldo_caixa >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                R$ {stats.cards.saldo_caixa?.toLocaleString()}
              </span>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Pizza: Distribuição de Estoque */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Distribuição de Estoque</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.chart_data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.chart_data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mensagem de Boas-vindas */}
        <div className="bg-brand-50 rounded-2xl p-8 border border-brand-100 flex flex-col justify-center items-center text-center">
            <h3 className="text-xl font-bold text-brand-900 mb-2">Painel de Controle Inteligente</h3>
            <p className="text-brand-700 mb-6">Seus dados estão sendo processados em tempo real do banco de dados Supabase.</p>
            <button className="bg-brand-600 text-white px-6 py-2 rounded-full font-medium hover:bg-brand-700 transition-colors">
              Ver Relatórios Detalhados
            </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
