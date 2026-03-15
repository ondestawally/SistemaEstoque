import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import Dashboard from './components/Dashboard';
import ComprasModal from './components/ComprasModal';
import WMSModal from './components/WMSModal';
import Vendas from './components/Vendas';
import Financeiro from './components/Financeiro';
import Parceiros from './components/Parceiros';
import Produtos from './components/Produtos';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.getHealth().then(ok => setHealth(ok));
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const navClass = (tab) => 
    `w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
      activeTab === tab ? 'bg-brand-600/20 text-brand-400' : 'hover:bg-slate-800 text-slate-300'
    }`;

  return (
    <div className="bg-slate-50 text-slate-800 h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10 transition-all duration-300">
          <div className="h-16 flex items-center justify-center border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-cyan-400">
                  📦 EstoqueAdmin
              </h1>
          </div>
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              <button onClick={() => setActiveTab('dashboard')} className={navClass('dashboard')}>
                  📊 Dashboard
              </button>
              <button onClick={() => setActiveTab('compras')} className={navClass('compras')}>
                  🛒 Compras (ERP)
              </button>
              <button onClick={() => setActiveTab('wms')} className={navClass('wms')}>
                  🏭 Armazém (WMS)
              </button>
              <button onClick={() => setActiveTab('vendas')} className={navClass('vendas')}>
                  💰 Vendas (ERP)
              </button>
              <button onClick={() => setActiveTab('financeiro')} className={navClass('financeiro')}>
                  💳 Financeiro
              </button>
              <button onClick={() => setActiveTab('parceiros')} className={navClass('parceiros')}>
                  🤝 Parceiros
              </button>
              <button onClick={() => setActiveTab('produtos')} className={navClass('produtos')}>
                  📦 Produtos
              </button>
          </nav>
          <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">
              v1.0.0 &copy; 2026
          </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
          {/* Top Nav */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
              <h2 className="text-xl font-semibold text-slate-800 capitalize">{activeTab}</h2>
              <div className="flex items-center gap-3">
                  <span className="flex h-3 w-3 relative">
                      {health === null ? (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                        </>
                      ) : health ? (
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      ) : (
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      )}
                  </span>
                  <span className="text-sm text-slate-500 font-medium">
                    {health === null ? 'Conectando...' : health ? 'API Online' : 'API Offline'}
                  </span>
              </div>
          </header>

          {/* Dynamic Pages */}
          <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'compras' && <ComprasModal setToast={setToast} />}
              {activeTab === 'wms' && <WMSModal setToast={setToast} />}
              {activeTab === 'vendas' && <Vendas setToast={setToast} />}
              {activeTab === 'financeiro' && <Financeiro />}
              {activeTab === 'parceiros' && <Parceiros setToast={setToast} />}
              {activeTab === 'produtos' && <Produtos setToast={setToast} />}
          </div>
      </main>

      {/* Global Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
            <div className={`p-4 w-72 border rounded-xl shadow-xl flex items-start gap-3 fade-in ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              <div className="flex-1 text-sm font-medium">{toast.msg}</div>
              <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
        </div>
      )}
    </div>
  );
}

export default App;
