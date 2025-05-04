// const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');

// Resize the canvas to fit the window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Variables for drawing
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let isBrushTextureLoaded = false; // Flag to check if the brush texture is loaded

// Brush texture (optional)
const brushTexture = new Image();
brushTexture.src = '../resources/brush-texture.png'; // Replace with your brush texture file path
brushTexture.onload = () => {
    isBrushTextureLoaded = true; // Set the flag to true when the image is loaded
};

// Start drawing
canvas.addEventListener('pointerdown', (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

// Stop drawing
canvas.addEventListener('pointerup', () => (isDrawing = false));
canvas.addEventListener('pointerleave', () => (isDrawing = false));

// Draw on the canvas
canvas.addEventListener('pointermove', (e) => {
    if (!isDrawing) return;

    if (isBrushTextureLoaded && false) { // not in use, TODO
        // Use brush texture if it's loaded
        ctx.drawImage(brushTexture, e.offsetX - 10, e.offsetY - 10, 20, 20); // Adjust size as needed

    } else {
        // Default smooth line drawing
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.strokeStyle = 'black'; // Default brush color
        ctx.lineWidth = 5; // Default brush size
        ctx.lineCap = 'round'; // Smooth line ends
        ctx.stroke();
    }

    [lastX, lastY] = [e.offsetX, e.offsetY];
});

// Utility method to draw a line
function drawLine(x1, y1, x2, y2, color = 'black', width = 2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

// Utility method to draw a point
function drawPoint(x, y, color = 'red', size = 5) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

// Utility method to draw an ellipse
function drawEllipse(x, y, radiusX, radiusY, rotation = 0, color = 'blue', width = 2) {
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

// Utility method to draw a plane (rectangle)
function drawPlane(x, y, width, height, color = 'rgba(0, 0, 255, 0.2)') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Function to generate a random point within the canvas
function generateRandomPoint() {
    return {
        x: Math.random() * (canvas.width - 350) + 300, // Adjust the width and height as needed,
        y: Math.random() * (canvas.height - 100) + 50, // Adjust the width and height as needed,
    };
}

// Utility function to interpolate between three colors
function getInterpolatedColor(value, min, max, lowColour, correctColour, highColour) {
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    value = clamp(value, min, max);

    if (value < 0) {
        const ratio = (value - min) / (-min);
        return interpolateColor(lowColour, correctColour, ratio);
    } else {
        const ratio = value / max;
        return interpolateColor(correctColour, highColour, ratio);
    }
}

// Utility function to interpolate between two colors
function interpolateColor(color1, color2, ratio) {
    const hexToRgb = (hex) => {
        const bigint = parseInt(hex.slice(1), 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    };

    const rgbToHex = (r, g, b) =>
        `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

    const [r1, g1, b1] = hexToRgb(color1);
    const [r2, g2, b2] = hexToRgb(color2);

    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);

    return rgbToHex(r, g, b);
}

// Example usage
// drawLine(50, 50, 200, 200);
// drawPoint(100, 100);
// drawEllipse(300, 300, 50, 30);
// drawPlane(400, 400, 100, 50);