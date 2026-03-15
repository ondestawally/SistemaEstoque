import React, { useState } from 'react';
import { api } from '../services/api';

const WMSModal = ({ setToast }) => {
  const [loading, setLoading] = useState(false);
  const [ocId, setOcId] = useState('OC-001');
  const [dataRec, setDataRec] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.receberMercadoria(ocId, dataRec);
      setToast({ msg: `📦 Entrada Sucesso! ${data.lotes_gerados.length} lotes gerados.`, type: 'success' });
    } catch (err) {
      setToast({ msg: `❌ ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-xl">
        <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">🏭</span>
            Receber Mercadoria (Gerar Lotes)
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vincular a Ordem de Compra</label>
                <input type="text" value={ocId} onChange={e => setOcId(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Recebimento</label>
                <input type="date" value={dataRec} onChange={e => setDataRec(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" required />
            </div>
            
            <button type="submit" disabled={loading} className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50">
                {loading ? 'Recebendo...' : 'Dar Entrada no WMS'}
            </button>
        </form>
    </div>
  );
};

export default WMSModal;
