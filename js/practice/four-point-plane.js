let points = [];

let strokeCount = 0; // Initialize stroke count

let userLine = [];
let userLines = []; // updated on completion

export function startPracticeMode() {
    // Generate two random points
    points = generateRandomPointSet(4, true); // Generate 4 random points

    // Draw the four points
    drawPoint(points[0].x, points[0].y, 'red', 8);
    drawPoint(points[1].x, points[1].y, 'red', 8);
    drawPoint(points[2].x, points[2].y, 'red', 8);
    drawPoint(points[3].x, points[3].y, 'red', 8);

    strokeCount = 0;

    userLines = [];
}

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
    strokeCount++; // Increment stroke count

    userLines.push(userLine); // Store the user's line

    if (strokeCount < 4) {
        return; // Only allow up to 4 strokes
    }

    // Analyze the user's line and provide feedback
    // Calculate the maximum and minimum deviation per line segment
    let totalMaxDeviation = 0;
    userLines.forEach(userLine => {
        let maxDeviation = 0;

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

        // draw a dashed line between the closest points
        ctx.setLineDash([5, 5]);
        drawLine(closestStartPoint.x, closestStartPoint.y, closestEndPoint.x, closestEndPoint.y, 'blue', 2);
        ctx.setLineDash([]);

        // get max deviation
        userLine.forEach((point) => {
            // get distance from line
            const deviation = Math.abs(getDistanceFromLine(point, closestStartPoint, closestEndPoint));

            if (deviation > maxDeviation) {
                maxDeviation = deviation;
            }
        });

        // Limit the maximum deviation to 100 pixels
        if (maxDeviation > totalMaxDeviation) {
            totalMaxDeviation = maxDeviation;
        }

        // for gradient
        if (maxDeviation > 100) {
            maxDeviation = 100;
        }

        // Analyze the user's line and recolor it
        userLine.forEach((point, index) => {
            if (index === 0) return; // Skip the first point
            const prevPoint = userLine[index - 1];

            const deviation = getDistanceFromLine(point, closestStartPoint, closestEndPoint);

            const color = getInterpolatedColor(deviation, -maxDeviation, maxDeviation, '#ff0000', '#00ff00', '#0000ff');
            drawLine(prevPoint.x, prevPoint.y, point.x, point.y, color, 3);
        });
    });

    // Print results
    updateFloatingInfo(`Practice mode complete! Max deviation: ${totalMaxDeviation.toFixed(2)} px`);
}