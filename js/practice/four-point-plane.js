let points = [];

export function startPracticeMode() {
    // Generate two random points
    points = generateRandomPointSet(4, true); // Generate 4 random points

    // Draw the four points
    drawPoint(points[0].x, points[0].y, 'red', 8);
    drawPoint(points[1].x, points[1].y, 'red', 8);
    drawPoint(points[2].x, points[2].y, 'red', 8);
    drawPoint(points[3].x, points[3].y, 'red', 8);
}
export function handlePointerUp(e) {

    if (strokeCount < 4) {
        return; // Only allow up to 4 strokes
    }

    // Analyze the user's line and provide feedback
    // Calculate the maximum and minimum deviation per line segment
    let totalMaxDeviation = 0;
    userLines.forEach(userLine => {

        // get start and ending points of the user line
        const startPoint = userLine[0];
        const endPoint = userLine[userLine.length - 1];

        // get the correct start and end points of the line segment
        // by determining the closest points in the original points array
        const closestStartPoint = points.reduce((prev, curr) => {
            return (Math.abs(curr.x - startPoint.x) + Math.abs(curr.y - startPoint.y) < Math.abs(prev.x - startPoint.x) + Math.abs(prev.y - startPoint.y)) ? curr : prev;
        })
        const closestEndPoint = points.reduce((prev, curr) => {
            return (Math.abs(curr.x - endPoint.x) + Math.abs(curr.y - endPoint.y) < Math.abs(prev.x - endPoint.x) + Math.abs(prev.y - endPoint.y)) ? curr : prev;
        })

        const maxDeviation = displayDeviationFromLine(userLine, closestStartPoint, closestEndPoint);

        // Limit the maximum deviation to 100 pixels
        if (maxDeviation > totalMaxDeviation) {
            totalMaxDeviation = maxDeviation;
        }

        // Draw the line segment between the two closest points
        ctx.setLineDash([5, 5]);
        drawLine(closestStartPoint.x, closestStartPoint.y, closestEndPoint.x, closestEndPoint.y, 'blue', 2);
        ctx.setLineDash([]);
    });

    // Print results
    updateFloatingInfo(`Max deviation: ${totalMaxDeviation.toFixed(2)} px`);
}