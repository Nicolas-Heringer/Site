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
let tipoDeInteracao = 'lennardJones';
let interactionEnabled = false;
let TEMP_LIMIT = 0.001;
let numParticles = 1;
let c = 1; // Velocidade da onda
let attenuation = 0.09; // Fator de resfriamento para reduzir a velocidade das partículas
let template = 'livre';
let epsilonCoulomb = 0.1; // Constante de acoplamento da interação coulombiana retardada

// Dicionário de estratégias de cálculo de interação
const calculadoresDeInteracao = {
    lennardJones(particle, wave, dx, dy, distance, distSq, force) {
        const dist6 = distSq * distSq * distSq;
        const fx = (0.1 * (dx / distance) - 0.1 * (dx / dist6)) * force;
        const fy = (0.1 * (dy / distance) - 0.1 * (dy / dist6)) * force;
        return { fx, fy };
    },
    ambos(particle, wave, dx, dy, distance, distSq, force) {
        return calculadoresDeInteracao.lennardJones(particle, wave, dx, dy, distance, distSq, force);
    },
    atracao(particle, wave, dx, dy, distance, distSq, force) {
        const fx = 0.1 * (dx / distance) * force;
        const fy = 0.1 * (dy / distance) * force;
        return { fx, fy };
    },
    repulsao(particle, wave, dx, dy, distance, distSq, force) {
        const fx = 0.1 * (dx / distance) * (-force);
        const fy = 0.1 * (dy / distance) * (-force);
        return { fx, fy };
    },
    coulomb(particle, wave, dx, dy, distance, distSq, force) {
        const qProduct = particle.charge * wave.charge;
        const dist6 = distSq * distSq * distSq;
        const factorCoulomb = -qProduct * epsilonCoulomb;
        const fx = (factorCoulomb * (dx / distance) - 0.01 * (dx / dist6)) * force;
        const fy = (factorCoulomb * (dy / distance) - 0.01 * (dy / dist6)) * force;
        return { fx, fy };
    }/* ,
    general(particle, wave, dx, dy, distance, distSq, force, repulsionComponent = 0.01) {
        const qProduct = particle.charge * wave.charge;
        const dist6 = distSq * distSq * distSq;
        const factorCoulomb = -qProduct * epsilonCoulomb;
        const fx = (factorCoulomb * (dx / distance) - repulsionComponent * (dx / dist6)) * force;
        const fy = (factorCoulomb * (dy / distance) - repulsionComponent * (dy / dist6)) * force;
        return { fx, fy };
    }*/
};

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
    waveCache.clear();
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
    Particle.nextId = 0;
    waveCache.clear();
    particles = createParticles(canvas, template);
});

// Evento de clique no botão de reset
resetButton.addEventListener('click', () => {
    // Reseta listas e o template
    circulos = [];
    particles = [];
    Particle.nextId = 0;
    waveCache.clear();
    positionTemplates.value = 'none';

    // Opcional: Atualiza a interface ou chama uma função de renderização
    console.log("Partículas e ondas resetadas");
});

// Classe para representar uma partícula
class Particle {
    static nextId = 0;

    constructor(x, y, radius, color, velocityX, velocityY, charge = 0, mass = 1) {
        this.id = Particle.nextId++;
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
        this.gamma = null;
    }

    // Método para atualizar a posição da partícula
    update(canvas, waves, interaction, interactionType) {
        if (interaction == true) {
            // Aplica forças das ondas (ignorando suas próprias ondas em O(1))
            waves.forEach(wave => {
                // Verifica se a onda foi emitida por outra partícula
                if (wave.emissorId !== this.id) {
                    const dx = (wave.x - this.x) / 100; // Distância no eixo X
                    const dy = (wave.y - this.y) / 100; // Distância no eixo Y
                    const distSq = dx * dx + dy * dy; // Distância ao quadrado

                    // Limiares ao quadrado para filtrar sem usar Math.sqrt
                    const minR = Math.max(0, wave.raio - 10);
                    const maxR = wave.raio + 10;

                    // Apenas calcula a raiz se a partícula estiver dentro do raio de influência
                    if (distSq >= minR * minR && distSq <= maxR * maxR) {
                        const distance = Math.sqrt(distSq); // Distância total
                        const force = 0.05; // Intensidade da força base
                        const calcular = calculadoresDeInteracao[tipoDeInteracao];
                        if (calcular) {
                            const { fx, fy } = calcular(this, wave, dx, dy, distance, distSq, force);
                            this.velocityX += fx / this.mass;
                            this.velocityY += fy / this.mass;
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
            // Adiciona uma nova onda informando carga e o ID da partícula emissora
            const novaOnda = new Circulo(this.x, this.y, this.charge, this.id);
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
        mass: () => 1,
        charge: () => 0,
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
        mass: () => 1,
        charge: () => 0,
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
        mass: () => 1,
        charge: () => 0,
    },
    circular: {
        num: () => 12, // Número fixo de partículas
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
        mass: () => 1,
        charge: () => 0,
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
        mass: () => 2,
        charge: () => 0,
    },
    NaCl: {
        num: () => 64, // Total de partículas (ajuste conforme necessário)
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
        color: (type) => (type === 'Na' ? 'orange' : 'cyan'), // Laranjado para Na, ciano para Cl
        mass: (type) => (type === 'Na' ? 2 : 4), // Massa maior para Cl
        charge: (type) => (type === 'Na' ? 1 : -1), // Carga para Na (+1) e Cl (-1)
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
        const mass = generator.mass ? generator.mass(type) : 1;
        const charge = generator.charge ? generator.charge(type) : 0;
        return new Particle(x, y, generator.radius(type), generator.color(type), vx, vy, charge, mass);
    });

    return particles;
}


// Cache de Sprites em Offscreen Canvas sob demanda (memoização por raio e carga)
const waveCache = new Map();

function criarWaveSpritePorRaio(charge, raio) {
    const r = Math.max(1, Math.round(raio));
    const padding = 2; // Margem para a linha de 1px não cortar
    const size = (r + padding) * 2;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = size;
    offCanvas.height = size;
    const offCtx = offCanvas.getContext('2d');

    const center = size / 2;
    const innerRadius = Math.max(0, r - r * 0.3);
    const outerRadius = r + r * 0.3;

    const grad = offCtx.createRadialGradient(
        center, center, innerRadius,
        center, center, outerRadius
    );

    let rgb;
    if (charge > 0) {
        rgb = '255, 140, 0'; // Laranja (Na+)
    } else if (charge < 0) {
        rgb = '0, 200, 255'; // Ciano (Cl-)
    } else {
        rgb = '0, 200, 180'; // Verde-água (Neutro)
    }

    grad.addColorStop(0, `rgba(${rgb}, 1)`);
    grad.addColorStop(1, `rgba(${rgb}, 0)`);

    offCtx.beginPath();
    offCtx.arc(center, center, r, 0, Math.PI * 2);
    offCtx.lineWidth = 1; // Espessura de linha fixa de 1px!
    offCtx.strokeStyle = grad;
    offCtx.stroke();
    offCtx.closePath();

    return offCanvas;
}

function getWaveSprite(charge, raio) {
    const rKey = Math.round(raio);
    const key = `${charge}_${rKey}`;
    let sprite = waveCache.get(key);
    if (!sprite) {
        sprite = criarWaveSpritePorRaio(charge, rKey);
        waveCache.set(key, sprite);
    }
    return sprite;
}

// Classe para criar as ondas
class Circulo {
    constructor(x, y, charge = 0, emissorId = null) {
        this.x = x; // Posição x do centro da onda
        this.y = y; // Posição y do centro da onda
        this.charge = charge; // Carga associada à onda gerada
        this.emissorId = emissorId; // ID da partícula que gerou a onda
        this.raio = 0; // Raio inicial da onda
        this.aSerRemovido = false; // Condição de remoção
    }

    // Atualiza o estado do círculo
    propagaCampo(c) {
        this.raio += c; // Propaga radialmente
        if (this.raio > canvas.width * 1.41) {
            this.aSerRemovido = true; // Marca para remoção quando sair da tela
        }
    }

    // Função de controle (brilho/intensidade)
    static intensidade(x) {
        return Math.min(1, Math.exp(-(x ** 2) / 2e4)); // Exemplo com decaimento exponencial
    }

    // Desenha o círculo no canvas usando o sprite pré-renderizado no raio exato (1:1 sem distorção)
    mostra(ctx) {
        if (this.raio <= 0) return;

        const intensidade = Circulo.intensidade(this.raio);
        if (intensidade <= 0.001) return; // Ignora ondas praticamente invisíveis

        const sprite = getWaveSprite(this.charge, this.raio);
        const halfSize = sprite.width / 2;

        ctx.save();
        ctx.globalAlpha = Math.min(1, Math.max(0, intensidade * 2));
        ctx.drawImage(
            sprite,
            this.x - halfSize,
            this.y - halfSize
        );
        ctx.restore();
    }
}

// Lista de partículas e ondas
let circulos = [];
let particles = createParticles(canvas, template); // Cria 10 partículas

// Função para calcular a energia cinética total do sistema (sem Math.sqrt)
function calcularEnergiaCinetica(particles) {
    let energiaTotal = 0;

    particles.forEach(particle => {
        const vSq = particle.velocityX * particle.velocityX + particle.velocityY * particle.velocityY;
        energiaTotal += 0.5 * particle.mass * vSq; // Ek = 0.5 * m * v^2
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

        // Remove ondas fora do canvas em O(1) via Swap-and-Pop
        if (circulo.aSerRemovido) {
            circulos[i] = circulos[circulos.length - 1];
            circulos.pop();
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

    requestAnimationFrame(anima); // Loop contínuo
}

// Inicia a animação
anima();

// -----------------------------------------------------------------------------
// PRÓXIMO PASSO:
// Efeito Doppler Relativístico e Cone de Mach (Radiação de Cherenkov)
// - Ativar o fator de Lorentz (gamma) para dilatação temporal da frequência de emissão.
// - Formação de ondas de choque quando v > c.
// -----------------------------------------------------------------------------