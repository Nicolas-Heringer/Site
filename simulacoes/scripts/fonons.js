// =============================================================================
// Autor: Nicolas Heringer
// Coautor / Revisor: Gemini 3.6 Flash
// Simulação: Fônons e Modos de Vibração em Redes Cristalinas
// Descrição: Simulação de acoplamento harmônico massa-mola em redes 2D,
//            excitação de fônons por forças de arrasto e modos normais de vibração.
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. CLASSES FÍSICAS (PARTÍCULA, MOLA E SISTEMA)
    // =========================================================================
    class Particula {
        constructor(x, y) {
            // Propriedades de estado
            this.x = x;
            this.y = y;
            this.vx = 0;
            this.vy = 0;
            this.ax = 0;
            this.ay = 0;

            // Propriedades físicas
            this.massa = 1;

            // Propriedade de grid
            this.fixa = false;
        }

        aplicarForca(fx, fy) {
            this.ax += fx / this.massa;
            this.ay += fy / this.massa;
        }

        resetarForcas() {
            this.ax = 0;
            this.ay = 0;
        }
    }

    class Mola {
        constructor(p1, p2, k) {
            this.p1 = p1;
            this.p2 = p2;
            this.k = k;
        }

        aplicarForcas() {
            const dx = this.p2.x - this.p1.x;
            const dy = this.p2.y - this.p1.y;

            // Lei de Hooke
            const forcaX = this.k * dx;
            const forcaY = this.k * dy;

            this.p1.aplicarForca(forcaX, forcaY);
            this.p2.aplicarForca(-forcaX, -forcaY);
        }
    }

    class SistemaParticulas {
        constructor() {
            this.particulas = [];
            this.molas = [];
            this.amortecimento = 0.005;
        }

        // Modificado para gerar diferentes redes e criar molas
        gerarRede(larguraGrid, alturaGrid, config) {
            this.particulas = [];
            this.molas = [];
            const px = config.px || 30;
            const py = config.py || 30;
            const padrao = config.padrao || 'uniforme';
            const massas = config.massas || [1];
            const ks = config.ks || { horizontal: 10, vertical: 10 };

            // Geração da grid com índices
            const nColunas = Math.floor((larguraGrid - 1) / px) + 1;
            const nLinhas = Math.floor((alturaGrid - 1) / py) + 1;

            const grid = [];
            for (let i = 0; i < nColunas; i++) {
                grid[i] = [];
                for (let j = 0; j < nLinhas; j++) {
                    const x = (larguraGrid - (nColunas - 1) * px) / 2 + i * px;
                    const y = (alturaGrid - (nLinhas - 1) * py) / 2 + j * py;
                    const particula = new Particula(x, y);

                    // Definir massa baseada no padrão
                    if (padrao === 'linhas') {
                        particula.massa = massas[j % massas.length];
                    } else if (padrao === 'checkerboard') {
                        particula.massa = massas[(i + j) % massas.length];
                    } else {
                        particula.massa = massas[0];
                    }

                    grid[i][j] = particula;
                    this.particulas.push(particula);
                }
            }

            // Conectar vizinhos criando molas para a direita e para baixo
            for (let i = 0; i < nColunas; i++) {
                for (let j = 0; j < nLinhas; j++) {
                    const p1 = grid[i][j];
                    if (i < nColunas - 1) {
                        const p2 = grid[i + 1][j];
                        this.molas.push(new Mola(p1, p2, ks.horizontal));
                    }
                    if (j < nLinhas - 1) {
                        const p2 = grid[i][j + 1];
                        this.molas.push(new Mola(p1, p2, ks.vertical));
                    }
                }
            }

            // Marcar partículas das bordas
            for (let i = 0; i < nColunas; i++) {
                for (let j = 0; j < nLinhas; j++) {
                    const particula = grid[i][j];
                    // Condições de borda
                    particula.fixa = (i === 0 || i === nColunas - 1 ||
                        j === 0 || j === nLinhas - 1);
                }
            }
        }

        atualizar(dt) {
            // Resetar forças
            this.particulas.forEach(p => p.resetarForcas());

            // Calcular forças elásticas através das molas
            this.molas.forEach(mola => mola.aplicarForcas());

            // Integração numérica (Euler semi-implícito)
            this.particulas.forEach(particula => {
                if (particula.fixa) {
                    // Mantém posição original e zera velocidades
                    particula.vx = 0;
                    particula.vy = 0;
                    return; // Sai da função sem atualizar posição
                }

                // Atualizar velocidades
                particula.vx += particula.ax * dt;
                particula.vy += particula.ay * dt;

                // Amortecimento
                particula.vx *= (1 - this.amortecimento);
                particula.vy *= (1 - this.amortecimento);

                // Atualizar posições
                particula.x += particula.vx * dt;
                particula.y += particula.vy * dt;
            });
        }
    }

    // =========================================================================
    // 2. INTERAÇÃO E CONTROLE COM MOUSE
    // =========================================================================
    class InteracaoMouse {
        constructor(canvas, sistema) {
            this.canvas = canvas;
            this.sistema = sistema;
            this.mousePressionado = false;
            this.posMouse = { x: 0, y: 0 };
            this.posAnterior = { x: 0, y: 0 };

            // Parâmetros ajustáveis
            this.raioInfluencia = 50;
            this.intensidade = 20;
            this.suavizacao = 0.5;

            this.configurarEventos();
        }

        configurarEventos() {
            const rect = this.canvas.getBoundingClientRect();

            this.canvas.addEventListener('mousedown', (e) => {
                this.mousePressionado = true;
                this.posAnterior = this.getPosMouse(e);
            });

            this.canvas.addEventListener('mousemove', (e) => {
                this.posMouse = this.getPosMouse(e);

                if (this.mousePressionado) {
                    const delta = {
                        x: this.posMouse.x - this.posAnterior.x,
                        y: this.posMouse.y - this.posAnterior.y
                    };

                    this.aplicarForcaArrasto(delta);
                    this.posAnterior = { ...this.posMouse };
                }

                //console.log(`Mouse position (${this.posMouse.x},${this.posMouse.y})`);
            });

            this.canvas.addEventListener('mouseup', () => {
                this.mousePressionado = false;
            });

            this.canvas.addEventListener('mouseout', () => {
                this.mousePressionado = false;
            });

            //console.log("Eventos configurados");

        }

        getPosMouse(e) {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }

        aplicarForcaArrasto(delta) {
            const fatorDt = 1 / 30; // Normalização para taxa de atualização fixa

            this.sistema.particulas.forEach(particula => {
                if (particula.fixa) return;

                const dx = particula.x - this.posMouse.x;
                const dy = particula.y - this.posMouse.y;
                const distancia = Math.sqrt(dx * dx + dy * dy);

                if (distancia < this.raioInfluencia) {
                    // Fator de suavização (função de peso)
                    const peso = Math.pow(1 - distancia / this.raioInfluencia, this.suavizacao);

                    // Aplica força proporcional ao movimento do mouse
                    particula.vx += delta.x * this.intensidade * peso * fatorDt;
                    particula.vy += delta.y * this.intensidade * peso * fatorDt;
                }
            });

            //console.log("Arrasto aplicado");
        }
    }

    // =========================================================================
    // 3. MAPEAMENTO DE CORES E RENDERIZAÇÃO CANVAS
    // =========================================================================
    // Função auxiliar para cores
    function velocidadeParaCor(vx, vy) {
        const velocidade = Math.sqrt(vx * vx + vy * vy);

        // Mapeamento não-linear para maior alcance dinâmico (não satura de imediato)
        // Usamos velocidade de referência de 15.0 para normalizar
        const maxVel = 15.0;
        const intensidade = Math.min(1, Math.pow(velocidade / maxVel, 0.7));

        // Mapeamento de cor (Plasma): Azul (220) -> Roxo -> Rosa -> Vermelho -> Amarelo (60)
        // Para ir de 220 a 60 (passando por 360/0), adicionamos 200 graus: (220 + 200) % 360 = 60
        const hue = Math.round((220 + intensidade * 200) % 360);

        // Partículas rápidas brilham mais e ficam mais saturadas (efeito neon/brilho)
        const saturacao = Math.round(30 + intensidade * 70);   // 30% -> 100%
        const luminosidade = Math.round(35 + intensidade * 25); // 35% -> 60%

        return `hsl(${hue}, ${saturacao}%, ${luminosidade}%)`;
    }

    // Sistema de renderização
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const sistema = new SistemaParticulas();
    const interacao = new InteracaoMouse(canvas, sistema);

    function renderizar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        sistema.particulas.forEach(particula => {
            ctx.beginPath();
            const raio = 4 * Math.pow(particula.massa, 0.4); // Ajusta o raio visualmente baseado na massa
            ctx.arc(particula.x, particula.y, raio, 0, Math.PI * 2);

            // Cor diferente para partículas fixas (bordas da rede)
            if (particula.fixa) {
                ctx.fillStyle = '#475569'; // Cinza ardósia discreto para as bordas fixas
            } else {
                ctx.fillStyle = velocidadeParaCor(particula.vx, particula.vy);
            }

            ctx.fill();
        });

        // Desenha área de influência quando arrastando
        if (interacao.mousePressionado) {
            ctx.beginPath();
            ctx.arc(interacao.posMouse.x, interacao.posMouse.y,
                interacao.raioInfluencia, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,0,0,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    // =========================================================================
    // 4. LOOP DE ANIMAÇÃO E EVENTOS DA INTERFACE
    // =========================================================================
    // Loop de animação
    let ultimoTempo = 0;
    let pausado = false;

    function animar(tempo) {
        const dt = (tempo - ultimoTempo) / 1000;
        ultimoTempo = tempo;

        if (dt <= 0.1 && !pausado) {
            sistema.atualizar(dt);
        }
        renderizar();

        requestAnimationFrame(animar);
    }

    document.getElementById('raioInput').addEventListener('input', (e) => {
        interacao.raioInfluencia = e.target.value;
    });

    document.getElementById('intensidadeInput').addEventListener('input', (e) => {
        interacao.intensidade = e.target.value;
    });

    const templates = {
        'uniforme_10': { px: 10, py: 10, padrao: 'uniforme', massas: [1], ks: { horizontal: 20, vertical: 20 } },
        'uniforme_20': { px: 20, py: 20, padrao: 'uniforme', massas: [1], ks: { horizontal: 20, vertical: 20 } },
        'uniforme_50': { px: 50, py: 50, padrao: 'uniforme', massas: [1], ks: { horizontal: 20, vertical: 20 } },
        'linhas_20': { px: 20, py: 20, padrao: 'linhas', massas: [1, 5], ks: { horizontal: 20, vertical: 20 } },
        'linhas_50': { px: 50, py: 50, padrao: 'linhas', massas: [1, 5], ks: { horizontal: 20, vertical: 20 } },
        'checkerboard_20': { px: 20, py: 20, padrao: 'checkerboard', massas: [1, 5], ks: { horizontal: 20, vertical: 20 } },
        'checkerboard_50': { px: 50, py: 50, padrao: 'checkerboard', massas: [1, 5], ks: { horizontal: 20, vertical: 20 } }
    };

    document.getElementById('seletor-de-template').addEventListener('change', (e) => {
        const config = templates[e.target.value] || templates['uniforme_50'];
        sistema.gerarRede(canvas.width, canvas.height, config);
        renderizar();
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
        const selector = document.getElementById('seletor-de-template');
        const config = templates[selector.value] || templates['uniforme_50'];
        sistema.gerarRede(canvas.width, canvas.height, config);
        renderizar();
    });

    document.getElementById('btn-pause').addEventListener('click', (e) => {
        pausado = !pausado;
        e.target.textContent = pausado ? 'Continuar' : 'Pausar';
    });

    // Estado Inicial
    sistema.gerarRede(canvas.width, canvas.height, templates['uniforme_50']);

    requestAnimationFrame(animar);
});