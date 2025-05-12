// Resize the canvas to fit the window
function resizeCanvas() {
    Globals.canvas.width = window.innerWidth;
    Globals.canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Variables for drawing
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let isBrushTextureLoaded = false; // Flag to check if the brush texture is loaded

// Brush texture (optional)
/*
const brushTexture = new Image();
brushTexture.src = '../resources/brush-texture.png'; // Replace with your brush texture file path
brushTexture.onload = () => {
    isBrushTextureLoaded = true; // Set the flag to true when the image is loaded
};
*/

// Start drawing
Globals.canvas.addEventListener('pointerdown', (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

// Stop drawing
Globals.canvas.addEventListener('pointerup', () => (isDrawing = false));
Globals.canvas.addEventListener('pointerleave', () => (isDrawing = false));

// Draw on the canvas
Globals.canvas.addEventListener('pointermove', (e) => {
    if (!isDrawing) return;

    if (isBrushTextureLoaded && false) { // not in use, TODO
        // Use brush texture if it's loaded
        ctx.drawImage(brushTexture, e.offsetX - 10, e.offsetY - 10, 20, 20); // Adjust size as needed

    } else {
        // Default smooth line drawing
        Globals.ctx.beginPath();
        Globals.ctx.moveTo(lastX, lastY);
        Globals.ctx.lineTo(e.offsetX, e.offsetY);
        Globals.ctx.strokeStyle = 'black'; // Default brush color
        Globals.ctx.lineWidth = 5; // Default brush size
        Globals.ctx.lineCap = 'round'; // Smooth line ends
        Globals.ctx.stroke();
    }

    [lastX, lastY] = [e.offsetX, e.offsetY];
});

class Colour{
    // Utility function to interpolate between two colors
    static interpolateColor(color1, color2, ratio) {
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

    // Utility function to interpolate between three colors
    static getInterpolatedColor(value, min, max, lowColour, correctColour, highColour) {
        const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
        value = clamp(value, min, max);

        if (value < 0) {
            const ratio = (value - min) / (-min);
            return Colour.interpolateColor(lowColour, correctColour, ratio);
        } else {
            const ratio = value / max;
            return Colour.interpolateColor(correctColour, highColour, ratio);
        }
    }
}

// class for handling points
class Point{
    #x; #y;
    constructor(x, y) {
        this.#x = x;
        this.#y = y;
    }

    get x() { return this.#x; };
    get y() { return this.#y; };

    draw(color = 'red', size = 5) {
        Globals.ctx.beginPath();
        Globals.ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        Globals.ctx.fillStyle = color;
        Globals.ctx.fill();
    }

    getDistance(point) {
        const out = Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
        return out;
    }

    // determine whether point is inside polygon (passed as array of Points)
    isInsidePolygon(vs) {
        // ray-casting algorithm based on
        // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
        
        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i].x, yi = vs[i].y;
            var xj = vs[j].x, yj = vs[j].y;
            
            var intersect = ((yi > this.y) != (yj > this.y))
                && (this.x < (xj - xi) * (this.y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        
        return inside;
    };

    // generate random point that is visible on canvas
    static generateRandomPoint() {
        return new Point(
            Math.random() * (Globals.canvas.width - 350) + 300,
            Math.random() * (Globals.canvas.height - 100) + 50
        );
    };
    
    // generate n random points
    // forceConvex: whether to generate a convex hull
    static generateRandomPointSet(n, forceConvex = false) {
        const points = [];
        for (let i = 0; i < n; i++) {
            // ensure points are not too close to each other
            let point = Point.generateRandomPoint();

            // ensure not too close
            let pointTooClose = points.some(p => point.getDistance(p) < Globals.minPointGenerationDistance); // stops here

            // check convex hull
            let pointInConvexHull = false;
            if (forceConvex) {
                // Check if the point is inside the convex hull of the existing points
                pointInConvexHull = point.isInsidePolygon(points);
            }

            if (pointTooClose || pointInConvexHull) {
                i--; // decrement i to retry this iteration
                continue;
            }

            points.push(point);
        }

        // check if we've made a convex hull
        if (forceConvex) {
            // if any points are inside the convex hull, restart
            if (points.some(p => p.isInsidePolygon(points.filter((_, i) => i !== points.indexOf(p))))) {
                // restart the function to generate a new set of points
                return Point.generateRandomPointSet(n, forceConvex);
            }
        }

        return points;
    }

    static getCentroid(points) {
        let x = 0;
        let y = 0;
        for (const point of points) {
            if (!point) { // handle nulls
                continue;
            }
            x += point.x;
            y += point.y;
        }
        return new Point(x / points.length, y / points.length);
    }
}

// class for handling lines
class Line {
    #startPoint; #endPoint;
    constructor(startPoint, endPoint) {
        this.#startPoint = startPoint;
        this.#endPoint = endPoint;
    }

    get startPoint() { return this.#startPoint; };
    get endPoint() { return this.#endPoint; };

    draw(color = 'black', width = 2) {
        Globals.ctx.beginPath();
        Globals.ctx.moveTo(this.startPoint.x, this.startPoint.y);
        Globals.ctx.lineTo(this.endPoint.x, this.endPoint.y);
        Globals.ctx.strokeStyle = color;
        Globals.ctx.lineWidth = width;
        Globals.ctx.stroke();
    }

    drawDashed(color = 'black', width = 2) {
        Globals.ctx.setLineDash([5, 5]);
        this.draw(color, width);
        Globals.ctx.setLineDash([]);
    }

    getLength(){
        return this.startPoint.getDistance(this.endPoint);
    }

    // Return the distance from a point to a line
    getDistanceFromLine(point) {
        const A = this.endPoint.y - this.startPoint.y;
        const B = this.endPoint.x - this.startPoint.x;
        const C = this.endPoint.x * this.startPoint.y - this.endPoint.y * this.startPoint.x;

        return (A * point.x - B * point.y + C) / Math.sqrt(A * A + B * B);
    }

    // return line that spans entire width of canvas
    // while keeping the current line
    getExtendedLine() {
        const slope = (this.endPoint.y - this.startPoint.y) / (this.endPoint.x - this.startPoint.x);
        const intercept = this.startPoint.y - slope * this.startPoint.x;
        const x1 = 0;
        const y1 = slope * x1 + intercept;
        const x2 = Globals.canvas.width;
        const y2 = slope * x2 + intercept;

        return new Line(new Point(x1, y1), new Point(x2, y2));
    }

    // Get intersection between this line and another, unbounded
    getIntersection(line) {
        const x1 = this.#startPoint.x;
        const y1 = this.#startPoint.y;
        const x2 = this.#endPoint.x;
        const y2 = this.#endPoint.y;

        const x3 = line.startPoint.x;
        const y3 = line.startPoint.y;
        const x4 = line.endPoint.x;
        const y4 = line.endPoint.y;
    
        const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (denom === 0) return null; // Lines are parallel
    
        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    
        //if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null; // Intersection is outside the line segments
    
        const intersectionX = x1 + ua * (x2 - x1);
        const intersectionY = y1 + ua * (y2 - y1);
    
        return new Point(intersectionX, intersectionY); // { x: intersectionX, y: intersectionY };
    }

    // draw the deviation from the line on the canvas
    // returns the maximum deviation, as an absolute value
    displayDeviationFromLine(userPoints) {
        let maxDeviation = 0;

        userPoints.forEach((point) => {
            const deviation = Math.abs(this.getDistanceFromLine(point));

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
        userPoints.forEach((point, index) => {
            if (index === 0) return; // Skip the first point
            const prevPoint = userPoints[index - 1];

            const deviation = this.getDistanceFromLine(point);

            const color = Colour.getInterpolatedColor(deviation, -maxDeviation, maxDeviation, '#ff0000', '#00ff00', '#0000ff');
            new Line(prevPoint, point).draw(color, 3);
        });

        return totalMaxDeviation
    }
}

// class for connected lines, for cube drawing
// where the line is connected to other lines at a vertex
class ConnectedLine extends Line{
    static #allLines = []; // all lines of this type
    #connectedLines = []; // lines connected to this line
    #axis = -1;

    constructor(startPoint, endPoint) {
        super(startPoint, endPoint);

        ConnectedLine.#allLines.push(this);
    }

    get allLines() { return ConnectedLine.#allLines; }
    get connectedLines() { return this.#connectedLines; }
    get axis() { return this.#axis; }

    clearAllLines() { ConnectedLine.#allLines = []; } // clear lines

    getMinDistanceFromEndpoint(otherLine) {
        const otherStart = otherLine.startPoint;
        const otherEnd = otherLine.endPoint;

        return Math.min(
            this.startPoint.getDistance(otherStart),
            this.startPoint.getDistance(otherEnd),
            this.endPoint.getDistance(otherStart),
            this.endPoint.getDistance(otherEnd)
        );
    }

    // connects the n closest lines
    getClosestLines(n) {
        this.#connectedLines = ConnectedLine.#allLines.filter((line) => line !== this) // remove self
            .sort((a, b) => a.getMinDistanceFromEndpoint(this) - b.getMinDistanceFromEndpoint(this)) // sort by distance
            .slice(0, n); // slice
    }

    // connects all lines closer than distance, in pixels
    getClosestLinesByDistance(distance) {
        this.#connectedLines = ConnectedLine.#allLines.filter((line) => line !== this) // remove self
            .filter((line) => line.getMinDistanceFromEndpoint(this) < distance); // filter by distance
    }

    // determine the parallel lines in a rectangle
    // set line to axis, then get all other parallel lines and set them to axis
    getOppositeLinesInQuadrilateral(axis) {
        this.#axis = axis;
        // trace lines
        for(const adjacentLine1 of this.connectedLines) {
            for(const adjacentLine2 of adjacentLine1.connectedLines.filter((line) => line !== this)) {
                for(const adjacentLine3 of adjacentLine2.connectedLines.filter((line) => line !== adjacentLine1)) {
                    if(adjacentLine3.connectedLines.includes(this)) {
                        // found a rectangle
                        // so adjacentLine2 is parallel to self
                        if(adjacentLine2.axis === -1) {
                            adjacentLine2.getOppositeLinesInQuadrilateral(axis);
                        }
                    }
                }
            }
        }
    }
}

// Utility method to draw an ellipse
function drawEllipse(x, y, radiusX, radiusY, rotation = 0, color = 'blue', width = 2) {
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}