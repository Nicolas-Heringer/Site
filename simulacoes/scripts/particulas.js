// Configurações iniciais
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Seletores de elementos DOM
const interactionSelector = document.getElementById('selector-de-interacao');
const temperatureSelector = document.getElementById('selector-de-temperatura');
const waveSpeedSelector = document.getElementById('selector-de-velocidade-onda');
const temperatureAtenuation = document.getElementById('temperature-atenuation');
const tiposDeInteracaoSelector = document.getElementById('selector-de-tipo-de-interacao');
const positionTemplates = document.getElementById('seletor-de-template');
const resetButton = document.getElementById('reset-button');


// Variáveis dinâmicas
let resetState = false;
let tipoDeInteracao = 'ambas';
let interactionEnabled = false;
let TEMP_LIMIT = 0.001;
let numParticles = 1;
let c = 1; // Velocidade da onda
let attenuation = 0.09; // Fator de resfriamento para reduzir a velocidade das partículas
let template = 'livre';

// Constantes físicas da simulação
const SCALE = 50;        // pixels por unidade de simulação (barra de escala)
const LJ_SIGMA = 60;     // σ: distância de equilíbrio LJ em pixels (≈ 1.6 u), zero do potencial
const LJ_EPSILON = 0.1; // ε: profundidade do poço de potencial (escala de força)

// Manipuladores de eventos
interactionSelector.addEventListener('change', () => {
    interactionEnabled = interactionSelector.value === 'ligada';
    console.log(`Interação: ${interactionEnabled}`);
    // Atualize a simulação aqui
});

temperatureSelector.addEventListener('change', () => {
    TEMP_LIMIT = temperatureSelector.value;
    console.log(`Temperatura: ${TEMP_LIMIT}`);
    // Atualize a simulação aqui
});

waveSpeedSelector.addEventListener('change', () => {
    c = parseFloat(waveSpeedSelector.value);
    console.log(`Velocidade da onda: ${c}`);
    // Atualize a velocidade da onda na simulação aqui
});

tiposDeInteracaoSelector.addEventListener('change', () => {
    tipoDeInteracao = `${tiposDeInteracaoSelector.value}`;
    console.log(`Interação selecionada: ${tipoDeInteracao}`);
});

temperatureAtenuation.addEventListener('input', () => {
    attenuation = parseFloat(temperatureAtenuation.value);
    console.log(`Atenuação da temperatura: ${attenuation}`);
    // Atualize a atenuação da temperatura na simulação
});

positionTemplates.addEventListener('input', () => {
    template = positionTemplates.value;
    console.log(`Template selecionado: ${template}`);
    particles = createParticles(canvas, template);
});

// Evento de clique no botão de reset
resetButton.addEventListener('click', () => {
    // Reseta listas e o template
    circulos = [];
    particles = [];
    positionTemplates.value = 'none';

    // Opcional: Atualiza a interface ou chama uma função de renderização
    console.log("Partículas e ondas resetadas");
});

// Classe para representar uma partícula
class Particle {
    constructor(x, y, radius, color, velocityX, velocityY, charge = 1, mass = 1) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.mass = mass;
        this.charge = charge;
        this.velocityX = velocityX; // Velocidade no eixo X
        this.velocityY = velocityY; // Velocidade no eixo Y
        this.waveTimer = 0; // Temporizador para emissão de ondas
        this.baseWaveInterval = 5;
        this.waveInterval = 5; // Intervalo entre emissões de ondas (em frames)
        this.ondasEmitidas = []; // Lista de ondas emitidas pela partícula
        this.gamma = null;
    }

    // Método para atualizar a posição da partícula
    update(canvas, waves, interaction, interactionType) {
        if (interaction == true) {
            // Interação via frente de onda — função de Green retardada: δ(r − c·t_ret)
            waves.forEach(wave => {
                // Ignora as próprias ondas da partícula
                if (!this.ondasEmitidas.includes(wave)) {
                    // Distância em pixels (mesma unidade que wave.raio)
                    const dx = wave.x - this.x;
                    const dy = wave.y - this.y;
                    const r = Math.sqrt(dx * dx + dy * dy);

                    if (r < 0.01) return; // Evita divisão por zero

                    // Espessura da frente de onda: a onda cruza um ponto em ~1 frame
                    const thickness = c + 2;

                    // Verifica se a partícula está sobre a frente de onda
                    if (Math.abs(r - wave.raio) < thickness) {
                        const r_ret = Math.max(1, wave.raio); // raio retardado (distância percorrida)

                        // Vetor unitário: posição retardada da fonte → receptor
                        const nx = (this.x - wave.x) / r;
                        const ny = (this.y - wave.y) / r;

                        // Magnitude: K / r_ret  (Green's function 2D — decaimento 1/r)
                        // ratio = σ/r_ret: normaliza a distância retardada pela escala LJ
                        const ratio = LJ_SIGMA / r_ret;

                        if (tipoDeInteracao === 'ambas') {
                            // Lennard-Jones completo retardado
                            // F(r) = (24ε/r)[2(σ/r)^12 − (σ/r)^6]
                            // r < σ·2^(1/6) ≈ 89.8 px: repulsivo | r > 89.8 px: atrativo
                            // Aqui seriam 80 px a distância de equilíbrio, mas eu ajustei lá em cima para 60
                            const F_LJ = (24 * LJ_EPSILON / r_ret) * (2 * ratio ** 12 - ratio ** 6);
                            this.velocityX += (F_LJ * nx) / this.mass;
                            this.velocityY += (F_LJ * ny) / this.mass;
                        } else if (tipoDeInteracao === 'atracao') {
                            const F_attr = -1;
                            this.velocityX += (F_attr * nx) / this.mass;
                            this.velocityY += (F_attr * ny) / this.mass;
                        } else if (tipoDeInteracao === 'repulsao') {
                            const F_rep = 1;
                            this.velocityX += (F_rep * nx) / this.mass;
                            this.velocityY += (F_rep * ny) / this.mass;
                        }
                    }
                }
            });
        }

        // Atualiza posição
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Verifica colisões com as bordas do canvas
        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
            this.velocityX *= -1; // Inverte a direção no eixo X
        }
        if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
            this.velocityY *= -1; // Inverte a direção no eixo Y
        }

        // Atualiza temporizador de emissão de ondas
        this.waveTimer++;
        if (this.waveTimer >= this.waveInterval) {
            this.waveTimer = 0;
            // Adiciona uma nova onda na posição atual da partícula
            // A onda carrega a carga da fonte (informação retardada)
            const novaOnda = new Circulo(this.x, this.y, this.charge);
            this.ondasEmitidas.push(novaOnda);
            waves.push(novaOnda);
        }
    }

    // Método para desenhar a partícula
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    // Método para reduzir a velocidade das partículas (resfriamento)
    reduceSpeed(attenuation) {
        this.velocityX *= (1 - attenuation);
        this.velocityY *= (1 - attenuation);
    }

    increaseSpeed() {
        this.velocityX *= (1 + attenuation);
        this.velocityY *= (1 + attenuation);
    }

    loretzFactor(c) {
        this.gamma = null;
        const v = Math.sqrt(this.velocityY ** 2 + this.velocityX ** 2);
        this.gamma = 1 / (Math.sqrt(1 - (v / (10 * c)) ** 2));
        this.waveInterval = this.baseWaveInterval / this.gamma;
    }
}

// Geradores de templates
const positionGenerators = {
    livre: {
        num: () => 1, // Apenas uma partícula
        generate(canvas, index) {
            const x = canvas.width / 2;
            const y = canvas.height / 2;
            return { x, y };
        },
        velocity: () => ({ x: 1, y: 1.2 }),
        radius: () => 5,
        color: () => `rgba(255, 255, 255, 1)`,
    },
    double: {
        num: () => 2, // Duas partículas
        generate(canvas, index) {
            const dist = canvas.width / 5;
            const x = canvas.width / 2 + dist * index - dist / 2;
            const y = canvas.height / 2;
            return { x, y };
        },
        velocity: (index) => ({ x: 0, y: 1 - (2 * index) }),
        radius: () => 5,
        color: () => `rgba(255, 255, 255, 1)`,
    },
    many: {
        num: () => 3,
        generate(canvas, index) {

            const dist = canvas.width / 2;
            const x = canvas.width / 2 - dist / 2 + dist * index / 3;
            const y = canvas.height / 2;
            return { x, y };
        },
        velocity: (index) => ({ x: 0, y: (1 - 2 * index / 3) }),
        radius: () => 5,
        color: () => `rgba(255, 255, 255, 1)`,
    },
    circular: {
        num: () => 20, // Número fixo de partículas
        generate(canvas, index, total) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(canvas.width, canvas.height) / 4;
            const angle = (index / total) * 2 * Math.PI; // Distribuição uniforme
            return {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
            };
        },
        velocity: () => ({ x: 0, y: 0 }),
        radius: () => 3,
        color: () => `rgba(255, 255, 255, 1)`,
    },
    grid: {
        num: () => 36, // Grid com 36 partículas
        generate(canvas, index, total) {
            const cols = Math.ceil(Math.sqrt(total));
            const rows = Math.ceil(total / cols);
            const gridX = index % cols;
            const gridY = Math.floor(index / cols);
            const spacingX = canvas.width / cols;
            const spacingY = canvas.height / rows;
            return {
                x: gridX * spacingX + spacingX / 2,
                y: gridY * spacingY + spacingY / 2,
            };
        },
        velocity: () => ({ x: 0, y: 0 }),
        radius: () => 3,
        color: () => `rgba(255, 255, 255, 1)`,
    },
    NaCl: {
        num: () => 36, // Total de partículas (ajuste conforme necessário)
        generate(canvas, index, total) {
            const cols = Math.ceil(Math.sqrt(total));
            const rows = Math.ceil(total / cols);
            const gridX = index % cols;
            const gridY = Math.floor(index / cols);
            const spacingX = canvas.width / cols;
            const spacingY = canvas.height / rows;

            return {
                x: gridX * spacingX + spacingX / 2,
                y: gridY * spacingY + spacingY / 2,
                type: (gridX + gridY) % 2 == 0 ? 'Na' : 'Cl', // Alterna entre 'Na' e 'Cl'
            };
        },
        velocity: () => ({ x: 0, y: 0 }),
        radius: (type) => (type === 'Na' ? 3 : 6), // Raio maior para Cl
        color: (type) => (type === 'Na' ? '#4a9eff' : '#ff6b6b'), // Azul para Na, vermelho para Cl
        charge: (type) => (type === 'Na' ? 1 : -1), // Na⁺ = +1, Cl⁻ = −1
    },
    none: {
        num: () => 0,
    },
};

// Função para criar partículas
function createParticles(canvas, template = "livre") {
    const generator = positionGenerators[template];

    if (!generator) {
        throw new Error(`Template "${template}" não é suportado.`);
    }

    const particleCount = generator.num();
    const particles = Array.from({ length: particleCount }, (_, i) => {
        const { x, y, type } = generator.generate(canvas, i, particleCount);
        const { x: vx, y: vy } = generator.velocity(i);
        const charge = generator.charge ? generator.charge(type) : 1;
        return new Particle(x, y, generator.radius(type), generator.color(type), vx, vy, charge);
    });

    return particles;
}


// Classe para criar as ondas
class Circulo {
    constructor(x, y, sourceCharge = 1) {
        this.x = x; // Posição x do centro da onda
        this.y = y; // Posição y do centro da onda
        this.raio = 0; // Raio inicial da onda
        this.aSerRemovido = false; // Condição de remoção
        this.sourceCharge = sourceCharge; // Carga da partícula emissora (informação retardada)
    }

    // Atualiza o estado do círculo
    propagaCampo(c) {
        this.raio += c; // Propaga radialmente
        if (this.raio > canvas.width * 1.41) {
            this.aSerRemovido = true; // Marca para remoção quando sair da tela
        }
    }

    // Função de controle (brilho/intensidade)
    static intensidade(raio) {
        // Decaimento 1/√r: conservação de energia em ondas cilíndricas 2D (Green's function)
        return Math.min(1, 5 / Math.sqrt(Math.max(1, raio)));
    }

    // Função para criar o gradiente com base na intensidade
    criaGradiente(ctx) {
        const grad = ctx.createRadialGradient(
            this.x, this.y, this.raio - this.raio * 0.3, // Raio interno
            this.x, this.y, this.raio + this.raio * 0.3  // Raio externo
        );

        const intensidade = Circulo.intensidade(this.raio); // Controle com decaimento
        grad.addColorStop(0, `rgba(0, 200, 180, ${intensidade})`);

        return grad;
    }

    // Desenha o círculo no canvas
    mostra(ctx) {
        ctx.beginPath();
        const grad = this.criaGradiente(ctx);

        ctx.lineWidth = 1;
        ctx.strokeStyle = grad;

        ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
    }
}

// Lista de partículas e ondas
let circulos = [];
let particles = createParticles(canvas, template); // Cria 10 partículas

// Função para calcular a energia cinética total do sistema
function calcularEnergiaCinetica(particles) {
    let energiaTotal = 0;

    particles.forEach(particle => {
        const velocidade = Math.sqrt(particle.velocityX ** 2 + particle.velocityY ** 2); // Calcula a magnitude da velocidade
        energiaTotal += 0.5 * particle.mass * velocidade * velocidade; // Energia cinética de cada partícula
    });

    return energiaTotal; // Retorna a energia cinética total
}

// Função para calcular a "temperatura" do sistema
function calcularTemperatura(particles) {
    const energiaCineticaTotal = calcularEnergiaCinetica(particles);
    const temperatura = (2 * energiaCineticaTotal) / (3 * particles.length); // Aproximadamente T = (2/3) * Energia / n
    return temperatura;
}

// Animação principal
function anima() {
    ctx.beginPath();
    ctx.fillStyle = 'rgba(20,20,20,1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
    ctx.closePath();

    // Atualiza e desenha ondas
    for (let i = circulos.length - 1; i >= 0; i--) {
        const circulo = circulos[i];
        circulo.propagaCampo(c);
        circulo.mostra(ctx);

        // Remove ondas fora do canvas e limpa referências nas partículas
        if (circulo.aSerRemovido) {
            particles.forEach(p => {
                const idx = p.ondasEmitidas.indexOf(circulo);
                if (idx !== -1) p.ondasEmitidas.splice(idx, 1);
            });
            circulos.splice(i, 1);
        }
    }

    // Atualiza e desenha partículas
    particles.forEach(particle => {
        particle.update(canvas, circulos, interactionEnabled, tipoDeInteracao);
        //particle.loretzFactor(c);
        particle.draw(ctx);
        //console.log(`Lorentz gamma = ${particle.gamma}`)
    });

    // Calculando a energia cinética total e temperatura
    const energiaCineticaTotal = calcularEnergiaCinetica(particles);
    const temperatura = calcularTemperatura(particles);

    //console.log(`Energia cinética total: ${energiaCineticaTotal}`);
    //console.log(`Temperatura do sistema: ${temperatura}`);

    // Se a temperatura ultrapassar o limite, resfria as partículas
    if (temperatura > TEMP_LIMIT) {
        particles.forEach(particle => particle.reduceSpeed(attenuation));
        //console.log("Temperatura excedeu o limite! Resfriando...");
    } else if (temperatura < TEMP_LIMIT) {
        particles.forEach(particle => particle.increaseSpeed(attenuation));
    }

    // Desenha a barra de escala de referência
    drawScale(ctx, canvas);

    requestAnimationFrame(anima); // Loop contínuo
}

// Barra de escala visual no canvas
function drawScale(ctx, canvas) {
    ctx.save();

    const barPx = SCALE; // 1 unidade em pixels
    const margin = 15;
    const y = canvas.height - margin;
    const x0 = margin;
    const x1 = x0 + barPx;

    // Fundo semi-transparente para legibilidade
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x0 - 6, y - 20, barPx + 18, 27);

    // Linha principal da barra
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();

    // Ticks nas extremidades
    [x0, x1].forEach(xTick => {
        ctx.beginPath();
        ctx.moveTo(xTick, y - 5);
        ctx.lineTo(xTick, y + 5);
        ctx.stroke();
    });

    // Rótulo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('1 u', (x0 + x1) / 2, y - 8);

    ctx.restore();
}

// Inicia a animação
anima();
