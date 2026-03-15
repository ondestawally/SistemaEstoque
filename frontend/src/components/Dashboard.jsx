import React from 'react';

const Dashboard = () => {
  return (
    <>
      <div className="fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-500">Módulos Ativos</span>
              <span className="text-3xl font-bold text-slate-800">2</span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-2">
              <span className="text-sm font-medium text-brand-600">Pedidos ERP Hoje</span>
              <span className="text-3xl font-bold text-brand-700">12</span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-2">
              <span className="text-sm font-medium text-indigo-500">Lotes no WMS</span>
              <span className="text-3xl font-bold text-indigo-600">45</span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-2">
              <span className="text-sm font-medium text-emerald-500">Health</span>
              <span className="text-3xl font-bold text-emerald-600">100%</span>
          </div>
      </div>
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center text-slate-500 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Bem vindo ao Admin ERP & WMS</h3>
          <p>Selecione uma das opções no menu lateral para iniciar as operações do dia.</p>
      </div>
    </>
  );
};

export default Dashboard;
