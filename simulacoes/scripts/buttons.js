// =============================================================================
// Autor: Nicolas Heringer
// Simulação: Controle UI — Sliders e Botões Gerais (Legado Seguro)
// =============================================================================

const slider = document.getElementById('aberturaSlider');
const sliderThumb = document.querySelector('.slider-thumb');
const aberturaValue = document.getElementById('aberturaValue');

if (slider && sliderThumb && aberturaValue) {
    slider.addEventListener('input', () => {
        const value = slider.value;
        const min = slider.min;
        const max = slider.max;
        const percent = ((value - min) / (max - min)) * 100;
        const valueRad = 2 * Math.PI * value / 360;
        sliderThumb.style.left = `${percent}%`;
        aberturaValue.textContent = `${value}° (${valueRad.toFixed(2)} Rad)`;
    });
}