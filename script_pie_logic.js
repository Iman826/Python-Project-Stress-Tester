
function generatePieSlices(total, currentVal, qId) {
    let slices = '';
    const anglePerSlice = 360 / total;
    const skew = 90 - anglePerSlice;

    for (let i = 1; i <= total; i++) {
        // We rotate each slice
        const rotate = (i - 1) * anglePerSlice;
        const isActive = i === parseInt(currentVal) ? 'active' : '';
        // Colors from Green (low stress) to Red (high stress)
        // Hue 120 (Green) -> 0 (Red)
        const hue = 120 - ((i - 1) / (total - 1)) * 120;

        slices += `
            <div class="pie-slice ${isActive}" 
                 style="transform: rotate(${rotate}deg) skew(${skew}deg); --slice-color: hsl(${hue}, 70%, 50%)"
                 onclick="handlePieClick(${i}, '${qId}')">
                 <span class="slice-number" style="transform: skew(-${skew}deg) rotate(-${rotate + anglePerSlice / 2}deg)">${i}</span>
            </div>
        `;
    }
    return `<div class="pie-chart-circle">${slices}</div>`;
}

window.handlePieClick = (val, qId) => {
    answers[qId] = val;
    renderQuestion();
};
