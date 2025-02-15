// fonons.js (versão atualizada)

document.addEventListener('DOMContentLoaded', () => {
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
            this.vizinhos = [];

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

    class SistemaParticulas {
        constructor() {
            this.particulas = [];
            this.kElastica = 10; // Constante elástica
            this.amortecimento = 0.0;
        }

        // Modificado para conectar vizinhos
        distribuirPorVetor(larguraGrid, alturaGrid, vetor) {
            this.particulas = [];
            const [px, py] = vetor;

            // Geração da grid com índices
            const nColunas = Math.floor((larguraGrid - 1) / px) + 1;
            const nLinhas = Math.floor((alturaGrid - 1) / py) + 1;
            
            const grid = [];
            for (let i = 0; i < nColunas; i++) {
                grid[i] = [];
                for (let j = 0; j < nLinhas; j++) {
                    const x = (larguraGrid - (nColunas - 1)*px)/2 + i*px;
                    const y = (alturaGrid - (nLinhas - 1)*py)/2 + j*py;
                    grid[i][j] = new Particula(x, y);
                    this.particulas.push(grid[i][j]);
                }
            }

            // Conectar vizinhos (primeiros vizinhos)
            for (let i = 0; i < nColunas; i++) {
                for (let j = 0; j < nLinhas; j++) {
                    const particula = grid[i][j];
                    if (i > 0) particula.vizinhos.push(grid[i-1][j]);
                    if (i < nColunas-1) particula.vizinhos.push(grid[i+1][j]);
                    if (j > 0) particula.vizinhos.push(grid[i][j-1]);
                    if (j < nLinhas-1) particula.vizinhos.push(grid[i][j+1]);
                }
            }

            // Marcar partículas das bordas
            for (let i = 0; i < nColunas; i++) {
                for (let j = 0; j < nLinhas; j++) {
                    const particula = grid[i][j];
                    // Condições de borda
                    particula.fixa = (i === 0 || i === nColunas-1 || 
                                    j === 0 || j === nLinhas-1);
                }
            }
        }

        atualizar(dt) {
            // Resetar forças
            this.particulas.forEach(p => p.resetarForcas());

            // Calcular forças elásticas
            this.particulas.forEach(particula => {
                particula.vizinhos.forEach(vizinho => {
                    const dx = vizinho.x - particula.x;
                    const dy = vizinho.y - particula.y;
                    
                    // Lei de Hooke
                    const forcaX = this.kElastica * dx;
                    const forcaY = this.kElastica * dy;
                    
                    particula.aplicarForca(forcaX, forcaY);
                    vizinho.aplicarForca(-forcaX, -forcaY);
                });
            });

            // Integração numérica (Euler semi-implícito)
            this.particulas.forEach(particula => {
                if(particula.fixa) {
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
            this.suavizacao = 0.8;

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
                
                if(this.mousePressionado) {
                    const delta = {
                        x: this.posMouse.x - this.posAnterior.x,
                        y: this.posMouse.y - this.posAnterior.y
                    };
                    
                    this.aplicarForcaArrasto(delta);
                    this.posAnterior = {...this.posMouse};
                }
            });

            this.canvas.addEventListener('mouseup', () => {
                this.mousePressionado = false;
            });

            this.canvas.addEventListener('mouseout', () => {
                this.mousePressionado = false;
            });
        }

        getPosMouse(e) {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }

        aplicarForcaArrasto(delta) {
            const fatorDt = 1/60; // Normalização para taxa de atualização fixa
            
            this.sistema.particulas.forEach(particula => {
                if(particula.fixa) return;
                
                const dx = particula.x - this.posMouse.x;
                const dy = particula.y - this.posMouse.y;
                const distancia = Math.sqrt(dx*dx + dy*dy);
                
                if(distancia < this.raioInfluencia) {
                    // Fator de suavização (função de peso)
                    const peso = Math.pow(1 - distancia/this.raioInfluencia, this.suavizacao);
                    
                    // Aplica força proporcional ao movimento do mouse
                    particula.vx += delta.x * this.intensidade * peso * fatorDt;
                    particula.vy += delta.y * this.intensidade * peso * fatorDt;
                }
            });
        }
    }

    // Função auxiliar para cores
    function velocidadeParaCor(vx, vy) {
        const velocidade = Math.sqrt(vx*vx + vy*vy);
        const intensidade = Math.min(1, velocidade * 5); // Ajuste o fator para sensibilidade
        const hue = 240 - (intensidade * 120); // Azul (baixa) → Vermelho (alta)
        return `hsl(${hue}, 100%, 50%)`;
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
            ctx.arc(particula.x, particula.y, 4, 0, Math.PI * 2);
            
            // Cor diferente para partículas fixas
            if(particula.fixa) {
                ctx.fillStyle = '#f000f0'; // Preto para fixas
            } else {
                ctx.fillStyle = velocidadeParaCor(particula.vx, particula.vy);
            }
            
            ctx.fill();
        });

        // Desenha área de influência quando arrastando
        if(interacao.mousePressionado) {
            ctx.beginPath();
            ctx.arc(interacao.posMouse.x, interacao.posMouse.y, 
                    interacao.raioInfluencia, 0, Math.PI*2);
            ctx.strokeStyle = 'rgba(255,0,0,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    // Loop de animação
    let ultimoTempo = 0;
    function animar(tempo) {
        const dt = (tempo - ultimoTempo) / 1000;
        ultimoTempo = tempo;
        
        if (dt > 0.1) return; // Evitar grandes saltos
        
        sistema.atualizar(dt);
        renderizar();
        requestAnimationFrame(animar);
    }

    // Adicione no JavaScript
    document.getElementById('raioInput').addEventListener('input', (e) => {
        interacao.raioInfluencia = e.target.value;
    });

    document.getElementById('intensidadeInput').addEventListener('input', (e) => {
        interacao.intensidade = e.target.value;
    });

    // Evento de template (atualizado)
    document.getElementById('seletor-de-template').addEventListener('change', (e) => {
        const templates = {
            'grid5': [5, 5],
            'grid10': [10,10],
            'grid20': [20,20],
            'grid': [10,15],
            // ... outros templates
        };

        const vetor = templates[e.target.value] || [30, 30];
        sistema.distribuirPorVetor(canvas.width, canvas.height, vetor);
        renderizar();
    });

    // Inicialização
    //sistema.distribuirPorVetor(canvas.width, canvas.height, [10, 10]);
    // Inicialize a interação após criar o sistema
    
    requestAnimationFrame(animar);
});
