function inicializarWebGL() {
    const canvas = document.getElementById("glCanvas");
    const gl = canvas.getContext("webgl2");

    if (!gl) {
        alert("Falha ao inicializar o WebGL.");
        return;
    }

    const vertexShaderSource = `#version 300 es
    in vec4 aVertexPosition;
    void main() {
        gl_Position = aVertexPosition;
    }`;

    const fragmentShaderSource = `#version 300 es
    precision highp float;
    uniform float uTime;
    float harmonicoEsferico(float m, float l, float theta, float phi) {
        // Implementação do harmônico esférico
    }
    float polinomioDeLaguerre(float alpha, float x) {
        // Implementação do polinômio de Laguerre
    }
    float funcaoDeOnda(float rho, float theta, float phi, float n, float l, float m) {
        float bohr_reduced_radius = ...; // Definir o valor adequado
        return sqrt((2.0 / (n * bohr_reduced_radius)) * (n-l-1.0) / (2.0 * n * (n+l))) *
               exp(-rho / 2.0) *
               pow(rho, l) *
               polinomioDeLaguerre(2.0 * l + 1.0, n - l - 1.0) *
               harmonicoEsferico(m, l, theta, phi);
    }
    void main() {
        float rho = ...; // Definir valor adequado
        float theta = ...;
        float phi = ...;
        float n = ...;
        float l = ...;
        float m = ...;
        float valorOnda = funcaoDeOnda(rho, theta, phi, n, l, m);
        gl_FragColor = vec4(valorOnda, valorOnda, valorOnda, 1.0);
    }`;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Não foi possível inicializar o shader program.");
        return;
    }

    gl.useProgram(shaderProgram);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        -1.0,  1.0,
         1.0,  1.0,
        -1.0, -1.0,
         1.0, -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


Console.log(`${inicializarWebGL()}`);