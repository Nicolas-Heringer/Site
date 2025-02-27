// script.js
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