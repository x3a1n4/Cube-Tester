// TODO: clean up

class CubeStructure {
    #vertices;
    constructor(vertices) {
        this.#vertices = vertices;
    }

    // get edges between vertices
}

class DrawnCube{
    #userLines;
    constructor (userLines) {
        this.#userLines = userLines;
    }

    get userLines() { return this.#userLines; }

    calculateVertices() {
        // loop through user lines
        // do this by finding the two closest endpoints to the end of each user line
        let points = this.userLines.flatMap(line => [line[0], line[line.length - 1]]);

        let vertices = points.map(point => {
            const twoClosestPoints = points.toSorted((a, b) => {
                return point.getDistance(a) - point.getDistance(b);
            }).slice(0, 2);
            return Point.getCentroid(twoClosestPoints.push(point));
        });

        // delete duplicates from centroids
        vertices = Array.from(new Set(vertices));
    }

    // draw deviation from ideal lines, and return max deviation
    drawDeviation(){
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

        return totalMaxDeviation;
    }
}