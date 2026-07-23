// =============================================================================
// Autor: Nicolas Heringer
// Coautor / Revisor: Gemini 3.6 Flash
// Simulação: Controle UI — Sliders e Botões Gerais
// Descrição: Manipulação interativa de elementos de entrada da interface (DOM),
//            atualização visual de posicionamento de sliders e rótulos de valores.
// =============================================================================

// =============================================================================
// 1. MANIPULAÇÃO DE SLIDERS E EVENTOS DE ENTRADA
// =============================================================================
const slider = document.getElementById('aberturaSlider');
const sliderThumb = document.querySelector('.slider-thumb');
const aberturaValue = document.getElementById('aberturaValue');

slider.addEventListener('input', () => {
    const value = slider.value;
    const min = slider.min;
    const max = slider.max;
    const percent = ((value - min) / (max - min)) * 100;
    const valueRad = 2 * Math.PI * value / 360;
    // Atualiza a posição do thumb
    sliderThumb.style.left = `${percent}%`;

    // Atualiza o valor exibido
    aberturaValue.textContent = `${value}° (${valueRad.toFixed(2)} Rad)`;
});