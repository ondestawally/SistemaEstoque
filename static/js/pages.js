const pages = {
    dashboard: `
        <div class="fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-2">
                <span class="text-sm font-medium text-slate-500">Módulos Ativos</span>
                <span class="text-3xl font-bold text-slate-800">2</span>
            </div>
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-2">
                <span class="text-sm font-medium text-brand-600">Pedidos ERP Hoje</span>
                <span class="text-3xl font-bold text-brand-700">12</span>
            </div>
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-2">
                <span class="text-sm font-medium text-indigo-500">Lotes no WMS</span>
                <span class="text-3xl font-bold text-indigo-600">45</span>
            </div>
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-2">
                <span class="text-sm font-medium text-emerald-500">Health</span>
                <span class="text-3xl font-bold text-emerald-600">100%</span>
            </div>
        </div>
        <div class="mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center text-slate-500 max-w-2xl mx-auto">
            <h3 class="text-xl font-semibold text-slate-700 mb-2">Bem vindo ao Admin ERP & WMS</h3>
            <p>Selecione uma das opções no menu lateral para iniciar as operações do dia.</p>
        </div>
    `,
    
    compras: `
        <div class="fade-in bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-xl">
            <h3 class="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <span class="bg-brand-100 text-brand-600 w-8 h-8 rounded-lg flex items-center justify-center">🛒</span>
                Emitir Ordem de Compra
            </h3>
            <form id="form-compra" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">ID do Pedido</label>
                        <input type="text" id="oc_id" value="OC-001" class="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">ID do Fornecedor</label>
                        <input type="text" id="oc_forn" value="F1" class="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors" required>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">ID do Produto</label>
                    <input type="text" id="oc_prod" value="P1" class="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors" required>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Quantidades</label>
                        <input type="number" id="oc_qtd" value="100" class="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Valor Un. (R$)</label>
                        <input type="number" step="0.01" id="oc_val" value="50.00" class="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors" required>
                    </div>
                </div>
                
                <button type="submit" class="w-full mt-6 bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-brand-500/30 transition-all transform active:scale-[0.98]">
                    Criar Pedido no ERP
                </button>
            </form>
        </div>
    `,

    wms: `
        <div class="fade-in bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-xl">
            <h3 class="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <span class="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">🏭</span>
                Receber Mercadoria (Gerar Lotes)
            </h3>
            <form id="form-wms" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Vincular a Ordem de Compra</label>
                    <input type="text" id="wms_oc" value="OC-001" class="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Data de Recebimento</label>
                    <input type="date" id="wms_data" class="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" required>
                </div>
                
                <button type="submit" class="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl shadow-lg transition-all transform active:scale-[0.98]">
                    Dar Entrada no WMS
                </button>
            </form>
        </div>
    `
};
