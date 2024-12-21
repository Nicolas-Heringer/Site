// Configurações iniciais
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Seletores de elementos DOM
const interactionSelector = document.getElementById('selector-de-interacao');
const temperatureSelector = document.getElementById('selector-de-temperatura');
const particlesInput = document.getElementById('number-of-particles');
const waveSpeedSelector = document.getElementById('selector-de-velocidade-onda');
const temperatureAtenuation = document.getElementById('temperature-atenuation');

// Variáveis dinâmicas
let interactionEnabled = false;
let TEMP_LIMIT = 1;
let numParticles = 0;
let c = 1; // Velocidade da onda
let attenuation = 0.5; // Fator de resfriamento para reduzir a velocidade das partículas

// Manipuladores de eventos
interactionSelector.addEventListener('change', () => {
    interactionEnabled = interactionSelector.value === 'ligada';
    console.log(`Interação: ${interactionEnabled}`);
    // Atualize a simulação aqui
});

temperatureSelector.addEventListener('change', () => {
    TEMP_LIMIT = parseInt(temperatureSelector.value, 10);
    console.log(`Temperatura: ${TEMP_LIMIT}`);
    // Atualize a simulação aqui
});

particlesInput.addEventListener('input', () => {
    numParticles = parseInt(particlesInput.value, 10);
    console.log(`Número de partículas: ${numParticles}`);
    // Crie ou atualize partículas com base no número especificado
    particles = createParticles(canvas, numParticles); // Exemplo de integração com a simulação
});

waveSpeedSelector.addEventListener('change', () => {
    c = parseFloat(waveSpeedSelector.value);
    console.log(`Velocidade da onda: ${c}`);
    // Atualize a velocidade da onda na simulação aqui
});

temperatureAtenuation.addEventListener('input', () => {
    attenuation = parseFloat(temperatureAtenuation.value);
    console.log(`Atenuação da temperatura: ${attenuation}`);
    // Atualize a atenuação da temperatura na simulação
});



// Classe para representar uma partícula
class Particle {
    constructor(x, y, radius, color, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.mass = 1;
        this.velocityX = velocityX; // Velocidade no eixo X
        this.velocityY = velocityY; // Velocidade no eixo Y
        this.waveTimer = 0; // Temporizador para emissão de ondas
        this.waveInterval = 60; // Intervalo entre emissões de ondas (em frames)
        this.ondasEmitidas = []; // Lista de ondas emitidas pela partícula
        this.gamma = null;
    }

    // Método para atualizar a posição da partícula
    update(canvas, waves, interaction) {
        if (interaction == true) {
            // Aplica forças das ondas (ignorando suas próprias ondas)
            waves.forEach(wave => {
                // Verifica se a onda foi emitida pela própria partícula
                if (!this.ondasEmitidas.includes(wave)) {
                    const dx = wave.x - this.x; // Distância no eixo X
                    const dy = wave.y - this.y; // Distância no eixo Y
                    const distance = Math.sqrt(dx * dx + dy * dy); // Distância total

                    // Verifica se a partícula está dentro da influência da onda
                    if (Math.abs(distance - wave.raio) < 10) {
                        // Calcula força de atração
                        const force = 0.05; // Intensidade da força
                        const fx = (dx / distance) * force; // Força no eixo X
                        const fy = (dy / distance) * force; // Força no eixo Y

                        // Aplica força à velocidade da partícula
                        this.velocityX += fx;
                        this.velocityY += fy;
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
    reduceSpeed() {
        this.velocityX *= attenuation;
        this.velocityY *= attenuation;
    }
    
    loretzFactor(c) {
        this.gamma = null;
        const v = Math.sqrt(this.velocityY**2 + this.velocityX**2);
        this.gamma = 1/(Math.sqrt(1-(v/(100*c))**2));
        this.waveInterval *= 1/this.gamma;
    }
}

// Função para criar partículas
function createParticles(canvas, particleCount) {
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 3; //Math.random() * 5 + 2;
        const color = `rgba(0, 0, 0, 0.8)`;
        /*const color = `rgba(${Math.floor(Math.random() * 255)}, 
                            ${Math.floor(Math.random() * 255)}, 
                            ${Math.floor(Math.random() * 255)}, 0.8)`;*/
        const velocityX = 0;//(Math.random() - 0.5) * 1;
        const velocityY = 0;//(Math.random() - 0.5) * 1;

        particles.push(new Particle(x, y, radius, color, velocityX, velocityY));
    }
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

    // Desenha o círculo no canvas
    mostra(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2); // Circunferência
        ctx.strokeStyle = "rgba(150, 100, 220, 1)";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Lista de partículas e ondas
let circulos = [];
let particles = createParticles(canvas, numParticles); // Cria 10 partículas

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
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas

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
        particle.update(canvas, circulos, interactionEnabled);
        particle.loretzFactor(c);
        particle.draw(ctx);
        console.log(`Lorentz gamma = ${particle.gamma}`)
    });

    // Calculando a energia cinética total e temperatura
    const energiaCineticaTotal = calcularEnergiaCinetica(particles);
    const temperatura = calcularTemperatura(particles);

    //console.log(`Energia cinética total: ${energiaCineticaTotal}`);
    //console.log(`Temperatura do sistema: ${temperatura}`);

    // Se a temperatura ultrapassar o limite, resfria as partículas
    if (temperatura > TEMP_LIMIT) {
        particles.forEach(particle => particle.reduceSpeed());
        console.log("Temperatura excedeu o limite! Resfriando...");
    }

    requestAnimationFrame(anima); // Loop contínuo
}

// Inicia a animação
anima();
