let point1 = null;
let point2 = null;

export function startPracticeMode() {
    // Generate two random points
    point1 = generateRandomPoint();
    point2 = generateRandomPoint();

    // Draw the two points
    drawLine(point1.x, point1.y, point2.x, point2.y, 'red', 8);
}

let userLine = [];

export function handlePointerDown(e) {
    // Start drawing
    userLine = [];
}

export function handlePointerMove(e) {
    if (!isDrawing) return; // Check if the user is drawing

    // Track the user's line
    userLine.push({ x: e.offsetX, y: e.offsetY });
}

export function handlePointerUp(e) {
    // Stop drawing

    // Draw a dashed line between the two points
    ctx.setLineDash([5, 5]);
    drawLine(point1.x, point1.y, point2.x, point2.y, 'blue', 2);
    ctx.setLineDash([]);

    // Analyze the user's line and provide feedback
    // Calculate the maximum and minimum deviation
    let maxDeviation = 0;

    userLine.forEach((point) => {
        const deviation = Math.abs(getDistanceFromLine(point, point1, point2));

        if (deviation > maxDeviation) {
            maxDeviation = deviation;
        }
    });

    // Limit the maximum deviation to 100 pixels
    const totalMaxDeviation = maxDeviation;
    if (maxDeviation > 100) {
        maxDeviation = 100;
    }

    // Analyze the user's line and recolor it
    userLine.forEach((point, index) => {
        if (index === 0) return; // Skip the first point
        const prevPoint = userLine[index - 1];

        const deviation = getDistanceFromLine(point, point1, point2);

        const color = getInterpolatedColor(deviation, -maxDeviation, maxDeviation, '#ff0000', '#00ff00', '#0000ff');
        drawLine(prevPoint.x, prevPoint.y, point.x, point.y, color, 3);
    });

    // Print results
    updateFloatingInfo(`Practice mode complete! Max deviation: ${totalMaxDeviation.toFixed(2)} px`);
}