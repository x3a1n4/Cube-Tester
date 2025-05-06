// allow the user to draw a cube in 3D space
// draw lines overtop of the strokes
// and display how close they are to coinciding with eachother at a VP
let userLineConnections = {};

export function startPracticeMode() {
    userLineConnections = {};
}

export function handlePointerUp(e) {

    if (strokeCount < 12) {
        return; // Only allow up to 12 strokes
    }

    // draw deviation
    let totalMaxDeviation = 0;
    userLines.forEach(userLine => {
        // Get the start and ending points of the each line segment
        const startPoint = userLine[0];
        const endPoint = userLine[userLine.length - 1];

        // Draw the derivation
        const maxDeviation = displayDeviationFromLine(userLine, startPoint, endPoint);

        // Limit the maximum deviation to 100 pixels
        if (maxDeviation > totalMaxDeviation) {
            totalMaxDeviation = maxDeviation;
        }
    });
    
    // Initialize userLineConnections, of format {userLine: [connectedLines]}
    userLines.forEach(userLine => {
        userLineConnections[userLine] = [];
    });

    // find lines that connect to each line at endpoints
    for(userLine of userLines) {
        userLineConnections[userLine] = userLines.toSorted((line1, line2) => {
            return getLineEndpointMinDistance(userLine, line1) - getLineEndpointMinDistance(userLine, line2);
        }).filter(line => line !== userLine).slice(0, 4); // get the four closest lines, // TODO add max distance or make it based on approach
    }

    // create as Line objects
    userLines = userLines.map(line => new Line(line[0].x, line[0].y, line[line.length - 1].x, line[line.length - 1].y))


    // now, search for cycles in the graph of length 4
    let VP_index = 0;
    while(userLines.some(line => line.VP === -1)) {
        userLines.forEach(line => line.traversed = false); // reset traversal

        const line = userLines.find(line => line.VP === -1); // get first unfound line
        line.VP = VP_index;
        line.traverse_graph();

        VP_index++;
    }

    console.log("VPs:", VP_index);

    // draw VP lines
    let VP_lines = {0: [], 1: [], 2: []}; // of format ID: [lines]
    userLines.forEach(line => {
        // add this line to a list
        VP_lines[line.VP].push(line.getVPLine());

        // and draw it
        const colour = ['blue', 'red', 'green'][line.VP];
        ctx.setLineDash([5, 5]);
        drawLine(line.getVPLine().x1, line.getVPLine().y1, line.getVPLine().x2, line.getVPLine().y2, colour, 2);
        ctx.setLineDash([]);
    });

    // get intersections within each VP
    const intersections = {0: [], 1: [], 2: []}; // of format ID: [intersections]
    for(const [VPId, lines] of Object.entries(VP_lines)) {
        for(const line1 of lines) {
            for(const line2 of lines) {
                const intersection = getIntersection(line1, line2);
                if(intersection) {
                    intersections[VPId].push(intersection);
                }
            }
        }
    }

    for(const [VPId, intersections] of Object.entries(intersections)) {
        const colour = ['blue', 'red', 'green'][VPId];
        const centroid = getCentroid(intersections);
        drawPoint(centroid.x, centroid.y, colour, 5);
    }

    // Print results
    updateFloatingInfo(`Max deviation: ${totalMaxDeviation.toFixed(2)} px`);
}

class Line{
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;

        this.traversed = false;
        this.VP = -1;
    }

    getLength() {
        return Math.sqrt((this.x2 - this.x1) ** 2 + (this.y2 - this.y1) ** 2);
    }

    getConnectedLines() {
        return userLineConnections[this];
    }

    getVPLine() {
        const slope = (endPoint.y - startPoint.y) / (endPoint.x - startPoint.x);
        const yIntercept = startPoint.y - slope * startPoint.x;
        const x1 = 0;
        const y1 = slope * x1 + yIntercept;
        const x2 = canvas.width;
        const y2 = slope * x2 + yIntercept;

        return Line(x1, y1, x2, y2);
    }

    // enter here at depth 0
    traverse_graph(orig = this, path = [], depth = 0) {
        if (depth > 3) return;

        this.traversed = true; // set to traversed
        path.push(this); // push self to path

        console.log(this);

        for(line of this.getConnectedLines()) {
            // if we found the original line at depth four, then we found a cycle
            if (line === orig && depth === 3) {

                // set path[2]'s VP, since it must be parallel, and traverse it too
                if(path[2].VP === -1) {
                    path[2].VP = orig.VP;
                    path[2].traverse_graph();
                }
                
                return; // no reason to continue here
            }
            
            // if we've already traversed this line, continue
            if (line.traversed) continue;

            line.traverse_graph(orig, path, depth + 1);
        }
    }
}

function getLineEndpointMinDistance(line1, line2) {
    const line1Start = line1[0];
    const line1End = line1[line1.length - 1];
    const line2Start = line2[0];
    const line2End = line2[line2.length - 1];

    return Math.min(
        getDistance(line1Start, line2Start),
        getDistance(line1Start, line2End),
        getDistance(line1End, line2Start),
        getDistance(line1End, line2End), 
    );
}

// code to calculate centroid of list of points
function getCentroid(points) {
    let x = 0;
    let y = 0;
    for (const point of points) {
        x += point.x;
        y += point.y;
    }
    return { x: x / points.length, y: y / points.length };
}