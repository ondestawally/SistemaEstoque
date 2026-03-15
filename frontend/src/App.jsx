import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import Dashboard from './components/Dashboard';
import ComprasModal from './components/ComprasModal';
import WMSModal from './components/WMSModal';
import Vendas from './components/Vendas';
import Financeiro from './components/Financeiro';
import Parceiros from './components/Parceiros';
import Produtos from './components/Produtos';
// Fase 6
import Estoque from './components/Estoque';
import ComprasWorkflow from './components/ComprasWorkflow';
import Fiscal from './components/Fiscal';
import Faturamento from './components/Faturamento';
import Contratos from './components/Contratos';
import Contabilidade from './components/Contabilidade';
// Fase 7
import RH from './components/RH';
import Controlling from './components/Controlling';
import Login from './components/Login';
import Auditoria from './components/Auditoria';
import Analytics from './components/Analytics';
import CRM from './components/CRM';
import Comissoes from './components/Comissoes';
import Expedicao from './components/Expedicao';

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { id: 'dashboard', icon: '📊', label: 'Dashboard', roles: ['ADMIN', 'RH_USER', 'FINANCE_USER', 'LOGISTICS_USER', 'SALES_USER', 'USER'] },
      { id: 'analytics', icon: '💎', label: 'Business Intelligence', roles: ['ADMIN', 'FINANCE_USER'] },
      { id: 'auditoria', icon: '📜', label: 'Auditoria', roles: ['ADMIN'] },
    ]
  },
  {
    label: 'Fase 6 — ERP Completo',
    items: [
      { id: 'estoque', icon: '📦', label: 'Estoque e Custos', roles: ['ADMIN', 'LOGISTICS_USER'] },
      { id: 'compras-workflow', icon: '🛒', label: 'Compras Workflow', roles: ['ADMIN', 'LOGISTICS_USER'] },
      { id: 'fiscal', icon: '🧾', label: 'Fiscal', roles: ['ADMIN', 'FINANCE_USER'] },
      { id: 'faturamento', icon: '💵', label: 'Faturamento', roles: ['ADMIN', 'SALES_USER', 'FINANCE_USER'] },
      { id: 'contratos', icon: '📋', label: 'Contratos', roles: ['ADMIN', 'FINANCE_USER', 'RH_USER'] },
      { id: 'contabilidade', icon: '📒', label: 'Contabilidade', roles: ['ADMIN', 'FINANCE_USER'] },
    ]
  },
  {
    label: 'Fase 7 — Enterprise',
    items: [
      { id: 'rh', icon: '👥', label: 'RH', roles: ['ADMIN', 'RH_USER'] },
      { id: 'controlling', icon: '📈', label: 'Controlling', roles: ['ADMIN', 'FINANCE_USER'] },
      { id: 'expedicao', icon: '🚚', label: 'Expedição', roles: ['ADMIN', 'LOGISTICS_USER'] },
    ]
  },
  {
    label: 'Base',
    items: [
      { id: 'compras', icon: '🛒', label: 'Compras (OC)', roles: ['ADMIN', 'LOGISTICS_USER'] },
      { id: 'wms', icon: '🏭', label: 'Armazém (WMS)', roles: ['ADMIN', 'LOGISTICS_USER'] },
      { id: 'vendas', icon: '💰', label: 'Vendas', roles: ['ADMIN', 'SALES_USER'] },
      { id: 'crm', icon: '🤝', label: 'CRM', roles: ['ADMIN', 'SALES_USER'] },
      { id: 'financeiro', icon: '💳', label: 'Financeiro', roles: ['ADMIN', 'FINANCE_USER'] },
      { id: 'comissoes', icon: '📈', label: 'Comissões', roles: ['ADMIN', 'SALES_USER', 'FINANCE_USER'] },
      { id: 'parceiros', icon: '🤝', label: 'Parceiros', roles: ['ADMIN', 'SALES_USER', 'LOGISTICS_USER'] },
      { id: 'produtos', icon: '📦', label: 'Produtos', roles: ['ADMIN', 'SALES_USER', 'LOGISTICS_USER'] },
    ]
  }
];

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  estoque: 'Estoque e Custos',
  'compras-workflow': 'Compras Workflow',
  fiscal: 'Fiscal',
  faturamento: 'Faturamento',
  contratos: 'Contratos',
  contabilidade: 'Contabilidade',
  rh: 'RH — Recursos Humanos',
  controlling: 'Controlling — Orçamento',
  compras: 'Compras (OC)',
  wms: 'Armazém WMS',
  vendas: 'Vendas',
  crm: 'CRM',
  financeiro: 'Financeiro',
  comissoes: 'Comissões',
  parceiros: 'Parceiros',
  produtos: 'Produtos',
  auditoria: 'Trilha de Auditoria (Audit Log)',
  analytics: 'Inteligência de Negócio (BI)',
  expedicao: 'Logística & Expedição',
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [health, setHealth] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.getHealth().then(ok => setHealth(ok));
    
    // Check Auth
    const token = localStorage.getItem('erp_token');
    const savedUser = localStorage.getItem('erp_user');
    if (token && savedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = () => {
    const savedUser = localStorage.getItem('erp_user');
    setIsLoggedIn(true);
    setUser(JSON.parse(savedUser));
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    api.logout();
    setIsLoggedIn(false);
    setUser(null);
    setActiveTab('dashboard');
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const navClass = (tab) =>
    `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${
      activeTab === tab ? 'bg-brand-600/20 text-brand-400' : 'hover:bg-slate-800 text-slate-300'
    }`;

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="bg-slate-50 text-slate-800 h-screen flex overflow-hidden relative">
      {/* Mobile Toggle */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl active:scale-90 transition-transform"
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-40 h-full w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        shadow-2xl md:shadow-none
      `}>
        <div className="h-14 flex items-center justify-center border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-cyan-400">
            📦 EstoqueAdmin
          </h1>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
          {NAV_GROUPS.map(group => {
            const visibleItems = group.items.filter(item => !item.roles || item.roles.includes(user?.role));
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.label}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-1.5">{group.label}</p>
                <div className="space-y-0.5">
                  {visibleItems.map(item => (
                    <button key={item.id} onClick={() => handleTabChange(item.id)} className={navClass(item.id)}>
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center font-bold text-xs">
              {user?.username?.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.username}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all text-xs font-medium"
          >
            <span>🚪</span> Sair
          </button>
        </div>
        <div className="p-3 border-t border-slate-700 text-[10px] text-slate-600 text-center">
          ERPEnt v2.1 — Fase 8 © 2026
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">{PAGE_TITLES[activeTab] || activeTab}</h2>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              {health === null ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                </>
              ) : health ? (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              )}
            </span>
            <span className="text-sm text-slate-500 font-medium">
              {health === null ? 'Conectando...' : health ? 'API Online' : 'API Offline'}
            </span>
          </div>
        </header>

        {/* Pages */}
        <div key={activeTab} className="p-6 md:p-8 max-w-7xl mx-auto w-full fade-in">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'compras' && <ComprasModal setToast={setToast} />}
          {activeTab === 'wms' && <WMSModal setToast={setToast} />}
          {activeTab === 'vendas' && <Vendas setToast={setToast} />}
          {activeTab === 'crm' && <CRM setToast={setToast} />}
          {activeTab === 'financeiro' && <Financeiro />}
          {activeTab === 'comissoes' && <Comissoes setToast={setToast} />}
          {activeTab === 'parceiros' && <Parceiros setToast={setToast} />}
          {activeTab === 'produtos' && <Produtos setToast={setToast} />}
          {/* Fase 6 */}
          {activeTab === 'estoque' && <Estoque setToast={setToast} />}
          {activeTab === 'compras-workflow' && <ComprasWorkflow setToast={setToast} />}
          {activeTab === 'fiscal' && <Fiscal setToast={setToast} />}
          {activeTab === 'faturamento' && <Faturamento setToast={setToast} />}
          {activeTab === 'contratos' && <Contratos setToast={setToast} />}
          {activeTab === 'contabilidade' && <Contabilidade setToast={setToast} />}
          {/* Fase 7 */}
          {activeTab === 'rh' && <RH setToast={setToast} />}
          {activeTab === 'controlling' && <Controlling setToast={setToast} />}
          {activeTab === 'auditoria' && <Auditoria />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'expedicao' && <Expedicao setToast={setToast} />}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50">
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
