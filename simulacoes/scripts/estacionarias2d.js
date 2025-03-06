const canvas = document.getElementById("simulacao");
const ctx = canvas.getContext("2d");

const fps = 60;
const dt = 1 / fps;
let tempoAnterior = 0;

const freq = 1;

const tamanhodDaCelula = 5;

const numDeColunas = canvas.width/tamanhodDaCelula;
const numDeLinhas = canvas.height/tamanhodDaCelula;

// Captura os elementos do DOM
const inputN = document.getElementById("n");
const inputM = document.getElementById("m");
const selectDrawType = document.getElementById("drawType");
const btnAtualizar = document.getElementById("atualizar");

// Variáveis globais para n, m e drawType
let n = parseInt(inputN.value);
let m = parseInt(inputM.value);
let drawTypeSelected = selectDrawType.value;

// Atualiza a simulação quando o botão "Atualizar" é clicado
btnAtualizar.addEventListener("click", () => {
    // Atualiza os valores de n e m
    n = parseInt(inputN.value);
    m = parseInt(inputM.value);
    
    // Atualiza o tipo de desenho
    drawTypeSelected = selectDrawType.value;
    
    // Redesenha o canvas
    draw(drawTypeSelected);
});

function linearmap(value,minFrom,maxFrom,minTo,maxTo){
    return minTo + (maxTo-minTo)*(value-minFrom)/(maxFrom-minFrom);
}

function Chladni(x, y, n, m) {
    const L = 1;
    const normalizedX = x / canvas.width;
    const normalizedY = y / canvas.height;
    return Math.cos(n * Math.PI * normalizedX / L) * Math.cos(m * Math.PI * normalizedY / L) - 
           Math.cos(m * Math.PI * normalizedX / L) * Math.cos(n * Math.PI * normalizedY / L);
}


const drawType = {
    // Mapeamento linear para escala de cinza
    mapped: (chladniValue) => {
        let colorValue = linearmap(chladniValue, -2.0, 2.0, 0, 255);
        return `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
    },

    // Mapeamento binário (preto ou branco)
    abs: (chladniValue) => {
        if (Math.abs(chladniValue) < 0.1) {
            return "rgb(0, 0, 0)"; // Preto
        } else {
            return "rgb(255, 255, 255)"; // Branco
        }
    },
    positiveAndNegative: (chladniValue) => {
        if (chladniValue < 0) {
            return "rgb(50, 0, 0)"; // Preto
        } else {
            return "rgb(0, 0, 50)"; // Branco
        }
    },

    // Adicione outros tipos de mapeamento aqui
    // Exemplo: cores aleatórias
    random: (chladniValue) => {
        let r = Math.floor(Math.random() * 256);
        let g = Math.floor(Math.random() * 256);
        let b = Math.floor(Math.random() * 256);
        return `rgb(${r}, ${g}, ${b})`;
    },

};

function draw(type = "mapped") {
    // Verifica se o tipo de desenho existe no objeto drawType
    if (!drawType[type]) {
        console.error(`Tipo de desenho "${type}" não encontrado. Usando "mapped" como padrão.`);
        type = "mapped";
    }

    for (let i = 0; i < numDeLinhas; i++) {
        for (let j = 0; j < numDeColunas; j++) {
            let chladniValue = Chladni(i * tamanhodDaCelula, j * tamanhodDaCelula, n, m);

            // Obtém a cor com base no tipo de desenho selecionado
            let color = drawType[type](chladniValue);

            // Desenha o quadrado
            ctx.beginPath();
            ctx.rect(j * tamanhodDaCelula, i * tamanhodDaCelula, tamanhodDaCelula, tamanhodDaCelula);
            ctx.fillStyle = color;
            ctx.strokeStyle = "black";
            ctx.stroke();
            ctx.fill();
        }
    }
}


function animacao() {
    const frametime = performance.now() - tempoAnterior
	
    // Limpa o canvas antes de redesenhar
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha o padrão de Chladni
    draw("selectDrawType");

    tempoAnterior = performance.now()
    //requestAnimationFrame(animacao);
}

animacao();