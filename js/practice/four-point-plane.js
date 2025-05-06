let points = [];

export function startPracticeMode() {
    // Generate two random points
    points = Point.generateRandomPointSet(4, true); // Generate 4 random points

    // Draw the four points
    points.forEach(point => {
        point.draw('red', 8);
    })
}

export function handlePointerUp(e) {

    if (PracticeInfo.strokeCount < 4) {
        return; // Only allow up to 4 strokes
    }

    // Analyze the user's line and provide feedback
    // Calculate the maximum and minimum deviation per line segment
    let totalMaxDeviation = 0;
    PracticeInfo.userLines.forEach(userLine => {

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

        const correctLine = new Line(closestStartPoint, closestEndPoint);

        const maxDeviation = correctLine.displayDeviationFromLine(userLine);

        // Set the new max deviation if larger
        if (maxDeviation > totalMaxDeviation) {
            totalMaxDeviation = maxDeviation;
        }

        // Draw the line segment between the two closest points
        correctLine.drawDashed('blue', 2);
    });

    // Print results
    updateFloatingInfo(`Max deviation: ${totalMaxDeviation.toFixed(2)} px`);
}