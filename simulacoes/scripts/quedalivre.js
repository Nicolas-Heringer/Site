const canvas = document.getElementById("simulacao");
const ctx = canvas.getContext("2d");

const g = 9.8*100; // Gravidade em m/s^2
const fps = 60; // Frames por segundo
const dt = 1 / fps; // Intervalo de tempo entre frames
const coeficienteDeRestituicao = 0.7;

let mouseXAnterior = 0; // Armazena a posição X anterior do mouse
let mouseYAnterior = 0; // Armazena a posição Y anterior do mouse
let tempoAnterior = 0; // Armazena o tempo do último frame

class Objeto {
    constructor(x, y, raio, massa) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        this.raio = raio;
        this.massa = massa;

        this.isHovered = false; // Indica se o mouse está sobre o objeto
        this.isClicked = false; // Indica se o objeto foi clicado
    }

    move() {
    	this.x += this.vx * dt;
    	this.y += this.vy * dt;
    }

    gravidade() {
        this.vy += g * dt; // Atualiza a velocidade vertical com a gravidade
    }

    verificaColisao(){
    	if (this.y+this.raio>=canvas.height){
    		
    		this.y -= (this.y + this.raio - canvas.height);
    		this.vy *= -coeficienteDeRestituicao;

    	} else if (this.y-this.raio<=0){
    		
    		this.y += (this.raio - this.y);
    		this.vy *= -coeficienteDeRestituicao;
    	}

    	if (this.x+this.raio>=canvas.width){
    		
    		this.x -= (this.x+this.raio - canvas.width);
    		this.vx *= -coeficienteDeRestituicao;
    	
    	} else if (this.x-this.raio<=0){
    		
    		this.x += (this.raio - this.x);
    		this.vx *= -coeficienteDeRestituicao;
    	}
    }

    desenha() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.raio, 0, 2 * Math.PI, true);

        // Cor baseada na velocidade (quanto mais rápido, mais vermelho)
        const velocidade = Math.sqrt(this.vx ** 2 + this.vy ** 2); // Magnitude da velocidade
        const intensidadeCor = Math.min(255, Math.floor(velocidade * 5)); // Limita a 255
        ctx.fillStyle = `rgb(${intensidadeCor}, 100, 100)`; // Vermelho varia com a velocidade
        ctx.fill(); // Preenche o objeto com a cor baseada na velocidade

        // Destaque no contorno se hovered ou clicado
        if (this.isClicked) {
            ctx.strokeStyle = "blue"; // Contorno azul quando clicado
            ctx.lineWidth = 3; // Espessura do contorno
        } else if (this.isHovered) {
            ctx.strokeStyle = "green"; // Contorno verde quando hovered
            ctx.lineWidth = 3; // Espessura do contorno
        } else {
            ctx.strokeStyle = "black"; // Contorno padrão
            ctx.lineWidth = 1; // Espessura padrão
        }

        ctx.stroke(); // Aplica o contorno
    }

    arrasta(mouseX, mouseY) {
        if (this.isClicked) {
            // Calcula a diferença de posição do mouse
            const deltaX = mouseX - mouseXAnterior;
            const deltaY = mouseY - mouseYAnterior;

            // Calcula o tempo decorrido desde o último frame
            const tempoAtual = performance.now();
            const deltaTempo = (tempoAtual - tempoAnterior) * 5 / 1000; // Converte para segundos

            // Define a velocidade do objeto com base no movimento do mouse
            this.vx = deltaX / deltaTempo; // Velocidade em pixels por segundo
			this.vy = deltaY / deltaTempo; // Velocidade em pixels por segundo

            // Atualiza a posição do objeto
            this.x = mouseX;
            this.y = mouseY;
        }

        // Atualiza as posições anteriores e o tempo
        mouseXAnterior = mouseX;
        mouseYAnterior = mouseY;
        tempoAnterior = performance.now();
    }
}

const bola = new Objeto(200, 200, 50);

function animacao() {
	tempoAnterior = performance.now()
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
    if(!bola.isClicked){
	    bola.move();
	    bola.gravidade(); // Aplica a gravidade
    }
    bola.verificaColisao();
    bola.desenha(); // Desenha a bola

    requestAnimationFrame(animacao); // Chama a próxima frame
}

// Função para verificar se o mouse está sobre o objeto
function verificaHover(mouseX, mouseY) {
    const distancia = Math.sqrt((mouseX - bola.x) ** 2 + (mouseY - bola.y) ** 2);
    bola.isHovered = distancia <= bola.raio; // Verifica se o mouse está sobre o objeto
}

// Evento de movimento do mouse
canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    verificaHover(mouseX, mouseY); // Verifica se o mouse está sobre o objeto
    bola.arrasta(mouseX, mouseY); // Arrasta o objeto se estiver clicado
});

// Evento de clique do mouse
canvas.addEventListener("mousedown", (event) => {
    if (bola.isHovered) {
        bola.isClicked = true; // Marca o objeto como clicado
    }
});

// Evento de soltar o clique do mouse
canvas.addEventListener("mouseup", () => {
    bola.isClicked = false; // Desmarca o objeto como clicado
});

animacao(); // Inicia a animação