// utils.js

// Map a number from one range to another
function mapRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// Create a gradient for visualizations
function createGradient(ctx, width, height, color1, color2) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
}

// Smooth a value (for smoother animations)
function lerp(start, end, amount) {
    return start + (end - start) * amount;
}

// Convert frequency value to color (optional for future modes)
function frequencyToColor(freq, maxFreq = 20000) {
    const hue = mapRange(freq, 20, maxFreq, 0, 360);
    return `hsl(${hue}, 100%, 50%)`;
}

// Basic energy calculation for beat detection enhancement
function calculateEnergy(dataArray) {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
    }
    return sum / dataArray.length;
}

window.utils = {
    mapRange,
    createGradient,
    lerp,
    frequencyToColor,
    calculateEnergy
};
