/**
 * =============================================================================
 * SIM-UI: Biblioteca de Componentes e Controladores do Design System
 * Autor: Nicolas Heringer
 * Projeto: Plataforma de Simulações Científicas e Matemáticas
 * Arquivo: sim-ui.js (100% Modular, Reutilizável e Desacoplado)
 * =============================================================================
 */

// --- CACHE GLOBAL DE ÍCONES SVG ---
const svgCache = new Map();

/**
 * Busca o conteúdo de um arquivo SVG e armazena em cache
 * @param {string} iconName - Nome do ícone em assets/icons/ (sem extensão)
 * @returns {Promise<string|null>}
 */
export async function getSVGContent(iconName) {
    const src = `../assets/icons/${iconName}.svg`;
    if (svgCache.has(src)) return svgCache.get(src);
    try {
        const res = await fetch(src);
        const text = await res.text();
        svgCache.set(src, text);
        return text;
    } catch (e) {
        return null;
    }
}

/**
 * Substitui ou insere um ícone SVG nativo dinamicamente mantendo currentColor
 * @param {HTMLElement} containerEl - Elemento container (ex: botão)
 * @param {string} iconName - Nome do ícone (sem .svg)
 */
export async function setElementIcon(containerEl, iconName) {
    const svgText = await getSVGContent(iconName);
    if (!svgText) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const newSvg = doc.querySelector('svg');
    if (!newSvg) return;
    newSvg.setAttribute('class', 'icon-svg');

    const existingIcon = containerEl.querySelector('.icon-svg');
    if (existingIcon) {
        existingIcon.replaceWith(newSvg);
    } else {
        containerEl.prepend(newSvg);
    }
}

/**
 * Transforma todas as tags <img> com class="icon-svg" em código SVG inline
 * permitindo que currentColor e variáveis CSS funcionem perfeitamente.
 */
export async function inlineSVGImages() {
    const images = document.querySelectorAll('img.icon-svg');
    for (const img of images) {
        const src = img.getAttribute('src');
        if (!src || !src.endsWith('.svg')) continue;

        let svgText;
        if (svgCache.has(src)) {
            svgText = svgCache.get(src);
        } else {
            try {
                const res = await fetch(src);
                svgText = await res.text();
                svgCache.set(src, svgText);
            } catch (e) {
                continue;
            }
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        if (svg) {
            svg.setAttribute('class', img.getAttribute('class') || 'icon-svg');
            if (img.id) svg.setAttribute('id', img.id);
            if (img.getAttribute('style')) svg.setAttribute('style', img.getAttribute('style'));
            img.replaceWith(svg);
        }
    }
}

/**
 * Altera a cor de acento global e sincroniza seletores visuais
 * @param {string} color - Cor hexadecimal ou CSS (ex: '#facc15')
 */
export function setGlobalAccent(color) {
    document.documentElement.style.setProperty('--accent-color', color);
    document.querySelectorAll('.theme-dot-btn, .toolbar-dot').forEach(d => {
        d.classList.toggle('active', d.getAttribute('data-color') === color);
    });
}

/**
 * Inicializa um botão de alternância binária (Toggle 0/1)
 * Gerencia classes .is-active, troca automática de rótulo e ícone, e dispara evento 'toggle'.
 * @param {HTMLElement|string} target - Seletor ou elemento do botão
 * @param {Function} [onToggleCallback] - Callback: (isActive, state, btnEl) => void
 * @returns {Object} Controlador com .toggle(), .setState(val), .getState(), .isActive()
 */
export function initToggleButton(target, onToggleCallback) {
    const btn = typeof target === 'string' ? document.querySelector(target) : target;
    if (!btn) return null;

    const textIdle = btn.getAttribute('data-text-idle') || 'Executar';
    const textActive = btn.getAttribute('data-text-active') || 'Pausar';
    const iconIdle = btn.getAttribute('data-icon-idle') || 'play';
    const iconActive = btn.getAttribute('data-icon-active') || 'pause';

    let state = parseInt(btn.getAttribute('data-state') || '0', 10);

    const renderState = async () => {
        const isActive = state === 1;
        btn.classList.toggle('is-active', isActive);
        btn.classList.toggle('active', isActive);
        btn.setAttribute('data-state', `${state}`);
        btn.setAttribute('aria-pressed', `${isActive}`);

        const textSpan = btn.querySelector('.btn-text');
        if (textSpan) {
            textSpan.textContent = isActive ? textActive : textIdle;
        }

        await setElementIcon(btn, isActive ? iconActive : iconIdle);
    };

    btn.addEventListener('click', async (e) => {
        if (e.isTrigger) return;
        state = state === 0 ? 1 : 0;
        await renderState();

        btn.dispatchEvent(new CustomEvent('toggle', {
            detail: { active: state === 1, state: state },
            bubbles: true
        }));

        if (typeof onToggleCallback === 'function') {
            onToggleCallback(state === 1, state, btn);
        }
    });

    renderState();

    return {
        toggle: () => btn.click(),
        setState: async (newState) => {
            state = newState ? 1 : 0;
            await renderState();
        },
        getState: () => state,
        isActive: () => state === 1
    };
}

/**
 * Sincroniza bidirecionalmente um Slider (range) com um Input Numérico (Dual-Input)
 * Valida limites min/max no blur e atualiza fluidamente em tempo real.
 * @param {HTMLInputElement|string} sliderTarget - Seletor ou elemento do slider (range)
 * @param {HTMLInputElement|string} numTarget - Seletor ou elemento do input numérico
 * @param {Function} [onChangeCallback] - Callback: (value, sliderEl, numEl) => void
 * @returns {Object} Controlador com .getValue(), .setValue(val)
 */
export function syncDualSlider(sliderTarget, numTarget, onChangeCallback) {
    const slider = typeof sliderTarget === 'string' ? document.querySelector(sliderTarget) : sliderTarget;
    const numInput = typeof numTarget === 'string' ? document.querySelector(numTarget) : numTarget;
    if (!slider || !numInput) return null;

    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;

    const handleSliderInput = () => {
        const val = parseFloat(slider.value);
        numInput.value = Number.isInteger(val) ? val : parseFloat(val.toFixed(3));
        if (typeof onChangeCallback === 'function') {
            onChangeCallback(val, slider, numInput);
        }
    };

    const handleNumberInput = (e) => {
        let val = parseFloat(numInput.value);
        if (isNaN(val)) return;

        if (e.type === 'change' || e.type === 'blur') {
            if (val < min) val = min;
            if (val > max) val = max;
            numInput.value = Number.isInteger(val) ? val : parseFloat(val.toFixed(3));
        }

        slider.value = val;
        if (typeof onChangeCallback === 'function') {
            onChangeCallback(val, slider, numInput);
        }
    };

    slider.addEventListener('input', handleSliderInput);
    numInput.addEventListener('input', handleNumberInput);
    numInput.addEventListener('change', handleNumberInput);
    numInput.addEventListener('blur', handleNumberInput);

    return {
        getValue: () => parseFloat(slider.value),
        setValue: (val) => {
            slider.value = val;
            numInput.value = val;
            if (typeof onChangeCallback === 'function') {
                onChangeCallback(val, slider, numInput);
            }
        }
    };
}

/**
 * Classe controladora de Mini-Gráficos de Telemetria 2D em tempo real via HTML5 Canvas
 */
export class RealtimePlot {
    /**
     * @param {HTMLCanvasElement|string} canvasTarget - Elemento canvas ou seletor CSS
     * @param {Object} [options]
     * @param {number} [options.maxPoints=80] - Quantidade máxima de pontos no buffer
     * @param {number} [options.minVal=-1.0] - Limite inferior da escala
     * @param {number} [options.maxVal=1.0] - Limite superior da escala
     * @param {string} [options.color='#38bdf8'] - Cor de fallback
     */
    constructor(canvasTarget, options = {}) {
        this.canvas = typeof canvasTarget === 'string' ? document.querySelector(canvasTarget) : canvasTarget;
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        this.maxPoints = options.maxPoints || 80;
        this.data = new Array(this.maxPoints).fill(0);
        this.color = options.color || '#38bdf8';
        this.minVal = options.minVal !== undefined ? options.minVal : -1.2;
        this.maxVal = options.maxVal !== undefined ? options.maxVal : 1.2;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        if (window.ResizeObserver && this.canvas.parentElement) {
            new ResizeObserver(() => this.resize()).observe(this.canvas.parentElement);
        }
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
        this.width = rect.width;
        this.height = rect.height;
        this.render();
    }

    push(val) {
        this.data.push(val);
        if (this.data.length > this.maxPoints) {
            this.data.shift();
        }
        this.render();
    }

    render() {
        if (!this.ctx || !this.width || !this.height) return;
        const { ctx, width, height, data } = this;

        ctx.clearRect(0, 0, width, height);

        // Grade Central Sutil
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        const currentMin = this.minVal;
        const currentMax = this.maxVal;
        const range = (currentMax - currentMin) || 1;
        const getY = (v) => height - ((v - currentMin) / range) * height;
        const stepX = width / (data.length - 1);

        // Curva
        ctx.beginPath();
        data.forEach((val, i) => {
            const x = i * stepX;
            const y = Math.max(2, Math.min(height - 2, getY(val)));
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        // 1. Preenchimento de Área com Gradiente
        ctx.save();
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const strokeColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-hud').trim() ||
                            getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() ||
                            this.color;

        const areaGrad = ctx.createLinearGradient(0, 0, 0, height);
        areaGrad.addColorStop(0, strokeColor.startsWith('#') ? `${strokeColor}44` : 'rgba(56, 189, 248, 0.25)');
        areaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = areaGrad;
        ctx.fill();
        ctx.restore();

        // 2. Traço da Linha com Efeito Glow
        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();
    }
}

/**
 * Inicializa um modal didático de diálogo ou teoria (.sim-modal-overlay)
 * Suporta fechamento por botão [data-modal-close], clique fora e tecla Esc.
 * @param {HTMLElement|string} modalTarget - Seletor ou elemento do modal
 * @returns {Object} Controlador com .open(), .close(), .toggle()
 */
export function initModal(modalTarget) {
    const modal = typeof modalTarget === 'string' ? document.querySelector(modalTarget) : modalTarget;
    if (!modal) return null;

    const open = () => {
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        if (window.renderMathInElement) {
            window.renderMathInElement(modal, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ]
            });
        }
    };

    const close = () => {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    modal.querySelectorAll('[data-modal-close], .sim-modal-close').forEach(btn => {
        btn.addEventListener('click', close);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            close();
        }
    });

    return {
        open,
        close,
        toggle: () => modal.classList.contains('hidden') ? open() : close()
    };
}

/**
 * Inicializa o controle de recolhimento lateral da barra de controles (Modo Foco)
 * Executa transição suave com redimensionamento contínuo da cena WebGL/Three.js.
 * @param {Object} [options]
 * @param {string} [options.layoutSelector='.sim-layout']
 * @param {string} [options.collapseBtnSelector='#btn-collapse-sidebar']
 * @param {string} [options.expandBtnSelector='#btn-expand-sidebar']
 * @param {Function} [options.onResize] - Callback chamado durante o resize (ex: onWindowResize)
 * @returns {Object} Controlador com .collapse(), .expand(), .toggle(), .isCollapsed()
 */
export function initSidebarCollapse({
    layoutSelector = '.sim-layout',
    collapseBtnSelector = '#btn-collapse-sidebar',
    expandBtnSelector = '#btn-expand-sidebar',
    onResize
} = {}) {
    const layout = document.querySelector(layoutSelector);
    const btnCollapse = document.querySelector(collapseBtnSelector);
    const btnExpand = document.querySelector(expandBtnSelector);
    if (!layout) return null;

    const smoothResize = () => {
        const start = performance.now();
        const duration = 350;
        const tick = (now) => {
            if (typeof onResize === 'function') onResize();
            if (now - start < duration) {
                requestAnimationFrame(tick);
            } else {
                if (typeof onResize === 'function') onResize();
            }
        };
        requestAnimationFrame(tick);
    };

    const collapse = () => {
        layout.classList.add('sidebar-collapsed');
        smoothResize();
    };

    const expand = () => {
        layout.classList.remove('sidebar-collapsed');
        smoothResize();
    };

    const toggle = () => {
        layout.classList.toggle('sidebar-collapsed');
        smoothResize();
    };

    if (btnCollapse) btnCollapse.addEventListener('click', collapse);
    if (btnExpand) btnExpand.addEventListener('click', expand);

    // Atalho de Teclado: Tecla 'F' ou '[' para alternar o painel lateral
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'f' || e.key === 'F' || e.key === '[') {
            toggle();
        }
    });

    return {
        collapse,
        expand,
        toggle,
        isCollapsed: () => layout.classList.contains('sidebar-collapsed')
    };
}

/**
 * Inicializa o componente Bottom Sheet para telas móveis e tablets (<= 900px)
 * Gerencia snap points ('peek', 'half', 'expanded'), gestos touch e cliques nas abas.
 * @param {Object} [options]
 * @param {string} [options.panelSelector='.controls-panel']
 * @param {string} [options.handleSelector='.sheet-drag-handle']
 * @param {string} [options.tabNavSelector='.tab-nav']
 * @param {string} [options.collapseBtnSelector='.btn-collapse-sidebar']
 * @param {string} [options.defaultState='peek'] - 'peek' | 'half' | 'expanded'
 * @param {Function} [options.onStateChange] - Callback: (state) => void
 * @returns {Object} Controlador com .setState(state), .getState(), .toggle()
 */
export function initBottomSheet({
    panelSelector = '.controls-panel',
    handleSelector = '.sheet-drag-handle',
    tabNavSelector = '.tab-nav',
    collapseBtnSelector = '.btn-collapse-sidebar',
    defaultState = 'peek',
    onStateChange
} = {}) {
    const panel = document.querySelector(panelSelector);
    const handle = document.querySelector(handleSelector);
    const tabNav = document.querySelector(tabNavSelector);
    const collapseBtn = document.querySelector(collapseBtnSelector);
    if (!panel) return null;

    let currentState = defaultState;

    const applyState = (state) => {
        if (window.innerWidth > 900) return;
        currentState = state;
        panel.classList.remove('sheet-peek', 'sheet-half', 'sheet-expanded');
        panel.classList.add(`sheet-${state}`);

        if (typeof onStateChange === 'function') {
            onStateChange(state);
        }
    };

    // Configura estado inicial se estiver em tela mobile
    if (window.innerWidth <= 900) {
        applyState(defaultState);
    }

    // Ao clicar na alça de arraste: alterna entre peek e half
    if (handle) {
        handle.addEventListener('click', () => {
            if (window.innerWidth > 900) return;
            const nextState = currentState === 'peek' ? 'half' : 'peek';
            applyState(nextState);
        });
    }

    // Ao clicar em qualquer aba no mobile: se estiver em peek, abre automaticamente para half
    if (tabNav) {
        tabNav.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.innerWidth <= 900 && currentState === 'peek') {
                    applyState('half');
                }
            });
        });
    }

    // Botão de recolher/minimizar na barra de abas
    if (collapseBtn) {
        collapseBtn.addEventListener('click', (e) => {
            if (window.innerWidth <= 900) {
                e.stopPropagation();
                const nextState = currentState === 'peek' ? 'half' : 'peek';
                applyState(nextState);
            }
        });
    }

    // Suporte a Touch Swipe Vertical na alça de arraste
    if (handle) {
        let touchStartY = 0;
        handle.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        handle.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const diffY = touchEndY - touchStartY;
            // Se arrastar para cima mais de 30px: abre
            if (diffY < -30) {
                applyState(currentState === 'peek' ? 'half' : 'expanded');
            }
            // Se arrastar para baixo mais de 30px: fecha
            else if (diffY > 30) {
                applyState(currentState === 'expanded' ? 'half' : 'peek');
            }
        }, { passive: true });
    }

    // Listener de redimensionamento de janela
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            panel.classList.remove('sheet-peek', 'sheet-half', 'sheet-expanded');
        } else if (!panel.classList.contains('sheet-peek') && !panel.classList.contains('sheet-half') && !panel.classList.contains('sheet-expanded')) {
            applyState(currentState);
        }
    });

    return {
        setState: applyState,
        getState: () => currentState,
        toggle: () => {
            const next = currentState === 'peek' ? 'half' : 'peek';
            applyState(next);
        }
    };
}

