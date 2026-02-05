(function () {
    'use strict';

    /* ================= CONFIGURAÇÃO DE TEXTOS E ESTILOS ================= */
    const CONFIG = {
        api_url: "http://localhost:9999",
        
        theme: {
            bg_main: "#161d25",
            bg_secondary: "#0f141a",
            bg_panel: "#1e2630",
            bg_hover: "#243140",
            border_main: "#2a3542",
            accent: "#66c0f4",
            text_main: "#ffffff",
            text_muted: "#aab4c3",
            danger: "#d94141",
            success: "#4caf50"
        },

        labels: {
            modal_title: "VOID BACKUP",
            btn_restart_steam: "Reiniciar Steam",
            btn_delete: "Excluir",
            btn_restore: "Restaurar",
            status_deleting: "Excluindo...",
            status_restoring: "Restaurando...",
            status_restarting: "Reiniciando"
        }
    };

    /* ================= ESTILOS (CSS) ================= */
    function ensureCalyStyles() {
        if (document.getElementById('caly-styles')) return;

        const style = document.createElement('style');
        style.id = 'caly-styles';
        style.textContent = `
:root {
    --bg-main: ${CONFIG.theme.bg_main};
    --bg-secondary: ${CONFIG.theme.bg_secondary};
    --bg-panel: ${CONFIG.theme.bg_panel};
    --bg-hover: ${CONFIG.theme.bg_hover};
    --border-main: ${CONFIG.theme.border_main};
    --accent: ${CONFIG.theme.accent};
    --text-main: ${CONFIG.theme.text_main};
    --text-muted: ${CONFIG.theme.text_muted};
    --danger: ${CONFIG.theme.danger};
    --success: ${CONFIG.theme.success};
}

#caly-fab {
    position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px;
    background: var(--bg-main); border-radius: 50%; display: flex;
    align-items: center; justify-content: center; cursor: pointer;
    color: var(--accent); border: 1px solid var(--border-main);
    box-shadow: 0 12px 30px rgba(0,0,0,0.6); z-index: 99999;
}

#caly-fab:hover { background: var(--bg-hover); }

.caly-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.82);
    backdrop-filter: blur(6px); display: flex; align-items: center;
    justify-content: center; z-index: 100000;
}

.caly-modal {
    background: var(--bg-panel); border: 1px solid var(--border-main);
    border-radius: 10px; width: 640px; max-width: 94vw;
    color: var(--text-main); box-shadow: 0 25px 60px rgba(0,0,0,0.85);
    overflow: hidden;
}

.caly-header {
    padding: 12px 24px;
    background: var(--bg-main);
    border-bottom: 1px solid var(--border-main); display: flex;
    justify-content: space-between; align-items: center;
}

.caly-title { font-size: 15px; font-weight: 600; color: var(--accent); }

#caly-close { cursor: pointer; font-size: 18px; color: var(--text-muted); padding: 8px; }
#caly-close:hover { color: var(--text-main); }

.caly-body { max-height: 62vh; overflow-y: auto; background: var(--bg-secondary); }

.caly-item {
    padding: 14px 20px; display: flex; align-items: center;
    gap: 14px; border-bottom: 1px solid rgba(255,255,255,0.05);
}

.caly-item:hover { background: rgba(102,192,244,0.06); }

.caly-game-img { width: 92px; height: 42px; border-radius: 4px; object-fit: cover; }

.caly-info { flex-grow: 1; }
.caly-main-text { font-weight: 600; font-size: 14px; }
.caly-sub-text { font-size: 12px; color: var(--text-muted); }

.caly-btn {
    background: var(--accent); border: none; color: #0b1117;
    padding: 6px 14px; border-radius: 4px; cursor: pointer;
    font-size: 12px; font-weight: 700; margin-left: 8px;
}

.caly-btn:disabled { opacity: 0.6; cursor: default; }
.caly-btn-success { background: var(--success); color: #08110a; }
.caly-btn-danger { background: var(--danger); color: #fff; }
.caly-btn-secondary { background: transparent; border: 1px solid var(--border-main); color: var(--text-muted); }
`;
        document.head.appendChild(style);
    }

    /* ================= LÓGICA DO SISTEMA ================= */

    function startCountdown(button, seconds, finalText, callback) {
        let remaining = seconds;
        button.disabled = true;
        button.textContent = `${finalText} em ${remaining}s…`;

        const interval = setInterval(() => {
            remaining--;
            if (remaining <= 0) {
                clearInterval(interval);
                callback();
            } else {
                button.textContent = `${finalText} em ${remaining}s…`;
            }
        }, 1000);
    }

    function createFloatingButton() {
        if (document.getElementById('caly-fab') || !document.body) return;
        ensureCalyStyles();
        const fab = document.createElement('div');
        fab.id = 'caly-fab';
        fab.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="22" height="22" fill="currentColor"><path d="M537.6 226.6C527.5 142.5 456.4 80 368 80c-63.4 0-117.8 32.1-150.4 80.6C160.4 168.8 96 225.5 96 296c0 79.5 64.5 144 144 144h272c61.9 0 112-50.1 112-112 0-58.7-45.1-106.8-102.4-113.4z"/></svg>`;
        fab.onclick = showRestoreModal;
        document.body.appendChild(fab);
    }

    function showRestoreModal() {
        document.querySelector('.caly-overlay')?.remove();
        ensureCalyStyles();

        const overlay = document.createElement('div');
        overlay.className = 'caly-overlay';
        overlay.innerHTML = `
<div class="caly-modal">
    <div class="caly-header">
        <div class="caly-title">${CONFIG.labels.modal_title}</div>
        <div style="display: flex; align-items: center;">
            <button id="caly-restart" class="caly-btn caly-btn-secondary">${CONFIG.labels.btn_restart_steam}</button>
            <span id="caly-close">✕</span>
        </div>
    </div>
    <div class="caly-body" id="caly-list-container"></div>
</div>`;

        document.body.appendChild(overlay);
        overlay.querySelector('#caly-close').onclick = () => overlay.remove();

        overlay.querySelector('#caly-restart').onclick = (e) => {
            // Timer para o botão de Reiniciar Steam avulso
            startCountdown(e.target, 3, CONFIG.labels.status_restarting, async () => {
                await fetch(`${CONFIG.api_url}/restart-steam`, { method: 'POST' });
            });
        };

        fetchBackups(overlay.querySelector('#caly-list-container'));
    }

    async function fetchBackups(container) {
        try {
            const res = await fetch(`${CONFIG.api_url}/list`);
            const backups = await res.json();
            container.innerHTML = '';

            backups.forEach(data => {
                const item = document.createElement('div');
                item.className = 'caly-item';

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'caly-btn caly-btn-danger';
                deleteBtn.textContent = CONFIG.labels.btn_delete;

                deleteBtn.onclick = async () => {
                    deleteBtn.disabled = true;
                    deleteBtn.textContent = CONFIG.labels.status_deleting;
                    await fetch(`${CONFIG.api_url}/delete/${data.folder}`, { method: 'DELETE' });
                    item.remove();
                };

                const restoreBtn = document.createElement('button');
                restoreBtn.className = 'caly-btn';
                restoreBtn.textContent = CONFIG.labels.btn_restore;

                restoreBtn.onclick = async () => {
                    // Muda a cor para indicar que a ação foi iniciada
                    restoreBtn.classList.add('caly-btn-success');
                    
                    // INICIA O TIMER ANTES DE CHAMAR O BACKEND
                    startCountdown(restoreBtn, 3, CONFIG.labels.status_restarting, async () => {
                        restoreBtn.textContent = "Processando...";
                        
                        // Chama o restore do backend (que mata a steam, copia e abre)
                        await fetch(`${CONFIG.api_url}/restore/${data.folder}`, { method: 'POST' });
                        
                        setTimeout(() => {
                            restoreBtn.textContent = "Finalizado!";
                            restoreBtn.disabled = false;
                        }, 2000);
                    });
                };

                item.innerHTML = `
<img src="https://cdn.cloudflare.steamstatic.com/steam/apps/${data.appid}/capsule_sm_120.jpg" class="caly-game-img" onerror="this.style.display='none'">
<div class="caly-info">
    <div class="caly-main-text">${data.nickname || data.game_name}</div>
    <div class="caly-sub-text">${data.folder}</div>
</div>`;

                item.appendChild(deleteBtn);
                item.appendChild(restoreBtn);
                container.appendChild(item);
            });
        } catch (e) { console.error("Erro ao buscar backups:", e); }
    }

    /* ================= INIT ================= */
    const observer = new MutationObserver(createFloatingButton);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(createFloatingButton, 50);

})();
