// Navigation & Events Logic
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    const colors = type === 'success' 
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
        : 'bg-red-50 text-red-800 border-red-200';
        
    toast.className = `p-4 w-72 border rounded-xl shadow-xl flex items-start gap-3 transform transition-all duration-300 translate-x-full opacity-0 ${colors}`;
    
    toast.innerHTML = `
        <div class="flex-1 text-sm font-medium">${message}</div>
        <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
    }, 10);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function navigate(page) {
    // Update Active Nav Style
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-brand-600/20', 'text-brand-400');
        btn.classList.add('hover:bg-slate-800', 'text-slate-300');
    });
    const clicked = event ? event.currentTarget : document.querySelector('nav').firstElementChild;
    clicked.classList.add('bg-brand-600/20', 'text-brand-400');
    clicked.classList.remove('hover:bg-slate-800', 'text-slate-300');
    
    // Set Content
    document.getElementById('content-container').innerHTML = pages[page];
    document.getElementById('page-title').innerText = page.charAt(0).toUpperCase() + page.slice(1);

    // Bind Modals if exist
    if (page === 'compras') bindComprasForm();
    if (page === 'wms') bindWMSForm();
}

function bindComprasForm() {
    document.getElementById('form-compra').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const oldTxt = btn.innerText;
        btn.innerText = "Criando...";
        btn.disabled = true;

        try {
            const data = await api.criarPedido(
                document.getElementById('oc_id').value,
                document.getElementById('oc_forn').value,
                document.getElementById('oc_prod').value,
                parseInt(document.getElementById('oc_qtd').value),
                parseFloat(document.getElementById('oc_val').value)
            );
            showToast(`✅ Pedido ${data.pedido_id} (${data.status}) de R$ ${data.valor_total} CRIADO!`);
        } catch (err) {
            showToast(`❌ ${err.message}`, 'error');
        } finally {
            btn.innerText = oldTxt;
            btn.disabled = false;
        }
    });
}

function bindWMSForm() {
    // prefill date limit
    document.getElementById('wms_data').valueAsDate = new Date();
    
    document.getElementById('form-wms').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const oldTxt = btn.innerText;
        btn.innerText = "Recebendo...";
        btn.disabled = true;

        try {
            const data = await api.receberMercadoria(
                document.getElementById('wms_oc').value,
                document.getElementById('wms_data').value
            );
            showToast(`📦 Entrada Sucesso! ${data.lotes_gerados.length} lotes gerados para armazém.`);
            console.log(data);
        } catch (err) {
            showToast(`❌ ${err.message}`, 'error');
        } finally {
            btn.innerText = oldTxt;
            btn.disabled = false;
        }
    });
}

// Initial Boot Sequence
async function boot() {
    const statusDot = document.getElementById('api-status');
    const statusTxt = document.getElementById('api-status-text');
    
    navigate('dashboard');
    
    const health = await api.getHealth();
    if (health) {
        statusDot.innerHTML = '<span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>';
        statusTxt.innerText = "API Online";
    } else {
        statusDot.innerHTML = '<span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>';
        statusTxt.innerText = "API Offline";
        showToast("Backend API não responde. Acesse o console Python.", "error");
    }
}

// Start app
window.onload = boot;
