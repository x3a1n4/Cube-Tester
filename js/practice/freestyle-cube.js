export function startPracticeMode() {
    //userLineConnections = {};
}

export function handlePointerUp(e) {

    updateFloatingInfo(`Drawn ${PracticeInfo.strokeCount} lines`);

    if (PracticeInfo.strokeCount < 12) {
        return; // Only allow up to 12 strokes
    }

    // create as Line objects
    const connectedUserLines = PracticeInfo.userLines.map(line => new ConnectedLine(
        new Point(line[0].x, line[0].y), 
        new Point(line[line.length - 1].x, line[line.length - 1].y)));
    
    // get max deviation
    let totalMaxDeviation = 0;
    connectedUserLines.forEach((line, index) => {
        // draw deviation
        const maxDeviation = line.displayDeviationFromLine(PracticeInfo.userLines[index]);
        if (maxDeviation > totalMaxDeviation) {
            totalMaxDeviation = maxDeviation;
        }
    });

    // get connected lines
    for(const connectedUserLine of connectedUserLines) {
        connectedUserLine.getClosestLines(4);
    }

    // get lines
    let axis = 0;
    for(const connectedUserLine of connectedUserLines) {
        if(connectedUserLine.axis === -1) {
            connectedUserLine.getOppositeLinesInQuadrilateral(axis);

            axis++; // increment axis
        }
    }

    // debug print
    for(const connectedUserLine of connectedUserLines) {
        console.log(connectedUserLine);
    }

    // Draw a dashed line, extended to the VP
    connectedUserLines.forEach(line => {
        line.getExtendedLine().drawDashed(['red', 'green', 'blue'][line.axis], 2);
    });

    // get VPs
    const VPs = [[], [], []];
    for(const axis in [0, 1, 2]){
        for(const line1 of connectedUserLines) {
            if(line1.axis == axis) {
                for(const line2 of connectedUserLines){
                    if(line2.axis == axis && line1 !== line2) {
                        VPs[axis].push(line1.getIntersection(line2));
                    }
                }
            }
        }
    }

    console.log(VPs)

    // draw centroids
    // todo: draw VPs more intelligently than just the centroids
    VPs.forEach((VP, i) => {
        Point.getCentroid(VP).draw(['red', 'green', 'blue'][i], 8);
    })

    // Print results
    updateFloatingInfo(`Max deviation: ${totalMaxDeviation.toFixed(2)} px`);
}