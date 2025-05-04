// Function to generate a random point within the canvas
function generateRandomPoint() {
    return {
        x: Math.random() * (canvas.width - 250) + 250,
        y: Math.random() * canvas.height,
    };
}

export function startPracticeMode() {
    // Generate two random points
    const point1 = generateRandomPoint();
    const point2 = generateRandomPoint();

    // Draw the two points
    drawPoint(point1.x, point1.y, 'red', 8);
    drawPoint(point2.x, point2.y, 'red', 8);

    // Wait for the user to draw a line
    let isDrawing = false;
    let userLine = [];

    canvas.addEventListener('mousedown', () => {
        isDrawing = true;
        userLine = [];
    });

    canvas.addEventListener('mouseup', () => {
        isDrawing = false;

        // Draw a dashed line between the two points
        ctx.setLineDash([5, 5]);
        drawLine(point1.x, point1.y, point2.x, point2.y, 'blue', 2);
        ctx.setLineDash([]);

        // Analyze the user's line
        const userStart = userLine[0];
        const userEnd = userLine[userLine.length - 1];
        const userSlope = (userEnd.y - userStart.y) / (userEnd.x - userStart.x);
        const correctSlope = (point2.y - point1.y) / (point2.x - point1.x);

        // Recolor the user's line based on its deviation
        userLine.forEach((point, index) => {
            if (index === 0) return; // Skip the first point
            const prevPoint = userLine[index - 1];

            const expectedY = point1.y + correctSlope * (point.x - point1.x);
            const deviation = point.y - expectedY;

            const color = getInterpolatedColor(deviation, -10, 10, 'red', 'green', 'blue');
            drawLine(prevPoint.x, prevPoint.y, point.x, point.y, color, 3);
        });

        // Print results
        const result = Math.abs(userSlope - correctSlope) < 0.1 ? 'Correct!' : 'Try again!';
        updateFloatingInfo(`Result: ${result}`);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        userLine.push({ x: e.offsetX, y: e.offsetY });
    });
}

// Utility function to interpolate between three colors
function getInterpolatedColor(value, min, max, lowColour, correctColour, highColour) {
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    value = clamp(value, min, max);

    if (value < 0) {
        const ratio = (value - min) / (0 - min);
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