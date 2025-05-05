let point1 = null;
let point2 = null;

export function startPracticeMode() {
    // Generate two random points
    point1 = generateRandomPoint();
    point2 = generateRandomPoint();

    // Draw the two points
    drawLine(point1.x, point1.y, point2.x, point2.y, 'red', 8);
}

export function handlePointerUp(e) {
    const totalMaxDeviation = displayDeviationFromLine(userLine, point1, point2);

    // Print results
    updateFloatingInfo(`Max deviation: ${totalMaxDeviation.toFixed(2)} px`);

    // Draw a dashed line between the two points
    ctx.setLineDash([5, 5]);
    drawLine(point1.x, point1.y, point2.x, point2.y, 'blue', 2);
    ctx.setLineDash([]);
}