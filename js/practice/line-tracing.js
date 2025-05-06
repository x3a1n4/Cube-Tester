let line = null;

export function startPracticeMode() {
    // Generate two random points
    const [point1, point2] = Point.generateRandomPointSet(2);
    line = new Line(point1, point2);

    // Draw the line
    line.draw('red', 5);
}

export function handlePointerUp(e) {
    const totalMaxDeviation = line.displayDeviationFromLine(PracticeInfo.userLine);

    // Print results
    updateFloatingInfo(`Max deviation: ${totalMaxDeviation.toFixed(2)} px`);

    // Draw a dashed line between the two points
    line.drawDashed('blue', 2);
}