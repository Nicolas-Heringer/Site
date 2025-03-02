window.onload = function () {
    // Configuração do canvas
    const canvas = document.getElementById('simulationCanvas');
    const ctx = canvas.getContext('2d');
    const canvasWidth = window.innerWidth - 100;
    const canvasHeight = window.innerHeight - 200;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const sliderAbertura = document.getElementById('aberturaSlider');
    const angleDisplay = document.getElementById('aberturaValue');

    const sliderNumFeixes = document.getElementById('numFeixesSlider');
    const numFeixesDisplay = document.getElementById('numFeixesValue');


    sliderAbertura.addEventListener('input', function () {
        const angle = parseInt(sliderAbertura.value);
        angleDisplay.textContent = angle + '°';
    });

    sliderNumFeixes.addEventListener('input', function () {
        const numFeixes = parseInt(sliderNumFeixes.value);
        numFeixesDisplay.textContent = numFeixes + ' feixes';
    });

    const refractiveIndexFunctions = {
        constante: {
            minN: 1.0,
            maxN: 1.0,
            n: function(x, y) {
                return 1.0;
            }
        },
        fibraOptica: {
            minN: 0.0,
            maxN: 2.0,
            n: function(x, y) {
                return 1.0 - 1.0 * Math.exp(y-canvas.height/2-50)/(Math.exp(y-canvas.height/2-50) + 1) + 1.0 * Math.exp(y-canvas.height/2+50)/(Math.exp(y-canvas.height/2+50) + 1);
            }
        },
        gaussiana: {
            minN: 1.0,
            maxN: 2.0,
            n: function(x, y) {
                return 2 - 1 * Math.exp(-0.0001 * ((x-canvasWidth/2)*(x-canvasWidth/2) + (y-canvasHeight/2)*(y-canvasHeight/2)));
            }
        },
        senoidal: {
            minN: -1.0,
            maxN: 4.0,
            n: function(x, y) {
                return 1.5 + 0.5 * Math.sin(x / 10) * Math.sin(y / 10);
            }
        },
        lenteConvergente: {
            minN: 1.0,
            maxN: 1.4,
            n: function(x, y) {
                const centroX = canvasWidth / 2;
                const centroY = canvasHeight / 2;
                const nFora = 1.0;
                const nDentro = 1.4;
                const suavizacao = 1;

                const xLeftParabola = 0.002 * ((y - centroY) ** 2) + (centroX - 50);
                const xRightParabola = -0.002 * ((y - centroY) ** 2) + (centroX + 50);

                let distanciaNormalizada;

                if (x < centroX) {
                    distanciaNormalizada = (x - xLeftParabola) / suavizacao;
                } else {
                    distanciaNormalizada = (xRightParabola - x) / suavizacao;
                }

                const transicao = 1 / (1 + Math.exp(-distanciaNormalizada));
                const n = nFora + (nDentro - nFora) * transicao;

                return n;
            }
        },
        lenteDivergente: {
            minN: 1.0,
            maxN: 1.4,
            n: function(x, y) {
                const centroX = canvasWidth / 2;
                const centroY = canvasHeight / 2;
                const nFora = 1.0;
                const nDentro = 1.4;
                const suavizacao = 1;
                const alturaMaxima = 120;

                const xLeftParabola = -0.002 * ((y - centroY) ** 2) + (centroX - 20);
                const xRightParabola = 0.002 * ((y - centroY) ** 2) + (centroX + 20);

                if (Math.abs(y - centroY) > alturaMaxima) {
                    return nFora;
                }

                let distanciaNormalizada;

                if (x < centroX) {
                    distanciaNormalizada = (x - xLeftParabola) / suavizacao;
                } else {
                    distanciaNormalizada = (xRightParabola - x) / suavizacao;
                }

                const transicao = 1 / (1 + Math.exp(-distanciaNormalizada));
                const n = nFora + (nDentro - nFora) * transicao;

                return n;
            }
        }
    };

    const feixes = [];

    canvas.addEventListener('click', function (event) {
        // Obter coordenadas do clique (ajustar para o sistema de coordenadas do canvas)
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Criar novos feixes na posição do clique
        criarFeixes(mouseX, mouseY, 2 * Math.PI * (sliderAbertura.value/360));
    });

    let selectedRefractiveIndexFunction = refractiveIndexFunctions.constante.n;

    function getRefractiveIndex(x, y) {
        return selectedRefractiveIndexFunction(x, y);
    }

    // Atualizar a função selecionada quando o usuário mudar a seleção
    document.getElementById('refractiveIndexFunction').addEventListener('change', function(event) {
        selectedRefractiveIndexFunction = refractiveIndexFunctions[event.target.value].n;
    });

    function updateRefractiveIndexMap() {
        for (let y = 0; y < canvasHeight; y++) {
            for (let x = 0; x < canvasWidth; x++) {
                // Calcular índice de refração
                const n = getRefractiveIndex(x, y);
                refractiveIndexMap[y][x] = n;

                // Calcular gradiente (diferenças centrais)
                const delta = 0.01;
                const nx_plus = getRefractiveIndex(x + delta, y);
                const nx_minus = getRefractiveIndex(x - delta, y);
                const ny_plus = getRefractiveIndex(x, y + delta);
                const ny_minus = getRefractiveIndex(x, y - delta);

                gradientMap[y][x] = {
                    x: (nx_plus - nx_minus) / (2 * delta), // Derivada em x
                    y: (ny_plus - ny_minus) / (2 * delta)  // Derivada em y
                };
            }
        }
    };

    document.getElementById('refractiveIndexFunction').addEventListener('change', function(event) {
        const selectedFunction = refractiveIndexFunctions[event.target.value];
        selectedRefractiveIndexFunction = selectedFunction.n;
        updateRefractiveIndexMap();

        const minN = selectedFunction.minN;
        const maxN = selectedFunction.maxN;
        const range = maxN - minN;

        drawBackgroundWithOpacity(1, minN, range);
    });

    // 2. Pré-computação dos dados
    const refractiveIndexMap = []; // Mapa de índices de refração
    const gradientMap = [];        // Mapa de gradientes

    for (let y = 0; y < canvasHeight; y++) {
        refractiveIndexMap[y] = [];
        gradientMap[y] = [];
        for (let x = 0; x < canvasWidth; x++) {
            // Calcular índice de refração
            const n = getRefractiveIndex(x, y);
            refractiveIndexMap[y][x] = n;

            // Calcular gradiente (diferenças centrais)
            const delta = 1;
            const nx_plus = getRefractiveIndex(x + delta, y);
            const nx_minus = getRefractiveIndex(x - delta, y);
            const ny_plus = getRefractiveIndex(x, y + delta);
            const ny_minus = getRefractiveIndex(x, y - delta);

            gradientMap[y][x] = {
                x: (nx_plus - nx_minus) / (2 * delta), // Derivada em x
                y: (ny_plus - ny_minus) / (2 * delta)  // Derivada em y
            };
        }
    }

    // 3. Desenhar o fundo com base no índice de refração
    function drawBackgroundWithOpacity(opacity, minN, range) {
        // Criar uma imagem temporária para o fundo
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvasWidth;
        tempCanvas.height = canvasHeight;
        const tempCtx = tempCanvas.getContext('2d');

        // Desenhar o fundo no canvas temporário
        const imageData = tempCtx.createImageData(canvasWidth, canvasHeight);
        const data = imageData.data;

        // Mapear índices para cores (gradiente azul -> vermelho)
        for (let y = 0; y < canvasHeight; y++) {
            for (let x = 0; x < canvasWidth; x++) {
                const n = refractiveIndexMap[y][x];
                const t = (n - minN) / range;
                const idx = (y * canvasWidth + x) * 4;

                data[idx] = 100 * (1 - t);           // Vermelho
                data[idx + 1] = 100 * (1 - t);             // Verde
                data[idx + 2] = 100 * (1 - t); // Azul
                data[idx + 3] = 255;           // Alpha
            }
        }
        tempCtx.putImageData(imageData, 0, 0);

        // Desenhar o fundo no canvas principal com opacidade
        ctx.globalAlpha = opacity;
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.globalAlpha = 1.0; // Restaurar opacidade padrão

    }

    // 4. Classe Feixe (partícula de luz)
    class Feixe {
        constructor(x, y, angle, color) {
            this.x = x;
            this.y = y;
            this.dirx = Math.cos(angle);
            this.diry = Math.sin(angle);
            this.color = color || 'rgba(0, 255, 0, 0.8)'; // Cor amarela
            this.foraDoCanvas = false;
        }

        update(ds) {
            // Arredondar coordenadas para índices inteiros
            const x = Math.round(this.x);
            const y = Math.round(this.y);

            // Verificar se as coordenadas estão dentro dos limites do canvas
            if (
                x >= 0 && x < canvasWidth &&
                y >= 0 && y < canvasHeight
            ) {
                // Acessar gradiente e índice de refração apenas se estiver dentro do canvas
                const grad = gradientMap[y][x];
                const n = refractiveIndexMap[y][x];

                // Atualizar direção (equação diferencial do raio)
                this.dirx += ds * grad.x / n;
                this.diry += ds * grad.y / n;

                // Normalizar vetor de direção
                const norm = Math.sqrt(this.dirx ** 2 + this.diry ** 2);
                this.dirx /= norm;
                this.diry /= norm;

                // Atualizar posição
                this.x += ds * this.dirx;
                this.y += ds * this.diry;
            } else {
                // Marcar o feixe para remoção
                this.foraDoCanvas = true;
            }
        }

        draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, 2, 2); // Desenhar como pequeno quadrado
        }
    }

    function criarFeixes(startX, startY,abertura) {
        const numFeixes = sliderNumFeixes.value; // Número de feixes a serem criados
        for (let i = 0; i < numFeixes; i++) {
            const angle = (abertura) * (i / numFeixes - 0.5); // Dispersão angular
            feixes.push(new Feixe(startX, startY, angle));
        }
    }

    // Inicializar o mapa de índices de refração
    updateRefractiveIndexMap();
    let counter = 0;
    // 6. Loop de animação
    function animate() {
        requestAnimationFrame(animate);

        // Calcular minN e range (se necessário)
        let minN = 1.0, maxN = 2.0;
        const range = maxN - minN;

        // Redesenhar o fundo com opacidade
        counter += 1;
        if (counter%600){

            drawBackgroundWithOpacity(0.005, minN, range); // Opacidade de 10%  
        }

        //
        
        // Atualizar e desenhar feixes
        for (let i = feixes.length - 1; i >= 0; i--) {
            const feixe = feixes[i];
            
            // Atualizar e desenhar o feixe
            feixe.update(1.0); // Passo de integração
            feixe.draw(ctx);

            // Verificar se o feixe está marcado para remoção
            if (feixe.foraDoCanvas) {
                feixes.splice(i, 1);
            }
        }

        //console.log(feixes)
    }

    // Iniciar simulação
    animate();
};