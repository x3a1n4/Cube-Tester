let point1 = null;
let point2 = null;

let line = null;

export function startPracticeMode() {
    // Generate two random points
    const [point1, point2] = Point.generateRandomPointSet(2);
    line = new Line(point1, point2);

    // Draw the two points
    point1.draw('red', 8);
    point2.draw('red', 8);
}

export function handlePointerUp(e) {
    // Calculate the maximum deviation
    const totalMaxDeviation = line.displayDeviationFromLine(PracticeInfo.userLine);

    // Print results
    updateFloatingInfo(`Max deviation: ${totalMaxDeviation.toFixed(2)} px`);

    // Draw a dashed line between the two points
    line.drawDashed('blue', 2);
}