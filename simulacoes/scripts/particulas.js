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
    template =  positionTemplates.value;
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
    constructor(x, y, radius, color, velocityX, velocityY, charge = 1 , mass = 1) {
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
            // Aplica forças das ondas (ignorando suas próprias ondas)
            waves.forEach(wave => {
                // Verifica se a onda foi emitida pela própria partícula
                if (!this.ondasEmitidas.includes(wave)) {
                    const dx = (wave.x - this.x)/100; // Distância no eixo X
                    const dy = (wave.y - this.y)/100; // Distância no eixo Y
                    const distance = Math.sqrt(dx * dx + dy * dy); // Distância total

                    // Verifica se a partícula está dentro da influência da onda
                    if (Math.abs(distance - wave.raio) < 10) {
                        // Calcula força de atração
                        const force = 0.05; // Intensidade da força

                        if (tipoDeInteracao==='ambas'){
                            const fx = (0.1 *(dx / distance)- 0.1 *(dx / distance**6)) * force;
                            const fy = (0.1 *(dy / distance)- 0.1 *(dy / distance**6)) * force;
                            // Aplica força à velocidade da partícula
                            this.velocityX += fx;
                            this.velocityY += fy;
                        } else if (tipoDeInteracao==='atracao') {
                            const fx = 0.1 * (dx / distance) * force;
                            const fy = 0.1 * (dy / distance) * force;
                            // Aplica força à velocidade da partícula
                            this.velocityX += fx;
                            this.velocityY += fy;
                        }else if (tipoDeInteracao==='repulsao') {
                            const fx = 0.1 * (dx / distance) * (-force);
                            const fy = 0.1 * (dy / distance) * (-force);
                            // Aplica força à velocidade da partícula
                            this.velocityX += fx;
                            this.velocityY += fy;
                        };

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
            const novaOnda = new Circulo(this.x, this.y);
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
        this.velocityX *= (1-attenuation);
        this.velocityY *= (1-attenuation);
    }

    increaseSpeed() {
        this.velocityX *= (1+attenuation);
        this.velocityY *= (1+attenuation);
    }
    
    loretzFactor(c) {
        this.gamma = null;
        const v = Math.sqrt(this.velocityY**2 + this.velocityX**2);
        this.gamma = 1/(Math.sqrt(1-(v/(10*c))**2));
        this.waveInterval = this.baseWaveInterval/this.gamma;
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
            const x = canvas.width / 2 + dist*index - dist/2;
            const y = canvas.height / 2;
            return { x, y };
        },
        velocity: (index) => ({ x: 0, y: 1 -( 2 * index) }),
        radius: () => 5,
        color: () => `rgba(255, 255, 255, 1)`,
    },
    many: {
        num: () => 3,
        generate(canvas, index) {

            const dist = canvas.width/2;
            const x = canvas.width / 2 - dist/2 + dist*index/3;
            const y = canvas.height / 2;
            return { x, y };
        },
        velocity: (index) => ({ x: 0, y: (1-2*index/3)}),
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
        color: (type) => (type === 'Na' ? 'blue' : 'green'), // Azul para Na, verde para Cl
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
        const { x, y , type} = generator.generate(canvas, i, particleCount);
        const { x: vx, y: vy } = generator.velocity(i);
        return new Particle(x, y, generator.radius(type), generator.color(type), vx, vy);
    });

    return particles;
}


// Classe para criar as ondas
class Circulo {
    constructor(x, y) {
        this.x = x; // Posição x do centro da onda
        this.y = y; // Posição y do centro da onda
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
        return Math.min(1, Math.exp(-(x**2)/1e4)); // Exemplo com decaimento exponencial
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

        // Remove ondas fora do canvas
        if (circulo.aSerRemovido) {
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
    } else if (temperatura < TEMP_LIMIT){
        particles.forEach(particle => particle.increaseSpeed(attenuation));
    }

    requestAnimationFrame(anima); // Loop contínuo
}

// Inicia a animação
anima();
