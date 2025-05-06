// this holds all of the practice logic
class PracticeInfo {
    static currentPracticeMode = null; // Store the current practice mode
    static currentPracticeModule = null; // Store the currently loaded practice module

    // manage stroke count-ensure strokes are a certain minimum length
    static strokeCount = 0;

    // array of Points
    static userLine = [];
    // array of arrays of Points
    static userLines = [];

    // Called when a practice mode is selected or reloaded
    static loadPracticeMode(practiceMode) {
        Globals.ctx.clearRect(0, 0, Globals.canvas.width, Globals.canvas.height); // Clear the canvas

        PracticeInfo.userLines = []; // Reset user lines
        PracticeInfo.strokeCount = 0; // Reset stroke count

        import(`./practice/${practiceMode}.js`)
            .then(module => {
                PracticeInfo.currentPracticeModule = module; // Store the loaded module
                if (module.startPracticeMode) {
                    module.startPracticeMode(); // Call the startPracticeMode function from the module
                }
            })
            .catch(err => {
                console.error(`Failed to load practice mode: ${practiceMode}`, err);
                updateFloatingInfo(`Error: Could not start practice mode for "${practiceMode}"`);
            });
    }
}

// Pointer down event
Globals.canvas.addEventListener('pointerdown', (e) => {
    PracticeInfo.userLine = [];

    if (PracticeInfo.currentPracticeModule && PracticeInfo.currentPracticeModule.handlePointerDown) {
        PracticeInfo.currentPracticeModule.handlePointerDown(e);
    }
});

// Pointer move event
Globals.canvas.addEventListener('pointermove', (e) => {
    if (!isDrawing) return; // Check if the user is drawing

    // Track the user's line
    PracticeInfo.userLine.push(new Point(e.offsetX, e.offsetY));

    if (PracticeInfo.currentPracticeModule && PracticeInfo.currentPracticeModule.handlePointerMove) {
        // Call the handlePointerMove function from the module
        PracticeInfo.currentPracticeModule.handlePointerMove(e);
    }
});

// Pointer up event
Globals.canvas.addEventListener('pointerup', (e) => {
    // Stop drawing
    // Get the start-end distance of the line
    if (PracticeInfo.userLine.length < 2) {
        return; // Ignore short strokes
    }
    
    // check distance
    const distance = PracticeInfo.userLine[0].getDistance(PracticeInfo.userLine[PracticeInfo.userLine.length - 1]);
    if (distance < Globals.minStrokeDistance) {
        return; // Ignore short strokes
    }

    PracticeInfo.strokeCount++; // Increment stroke count
    PracticeInfo.userLines.push(PracticeInfo.userLine); // Store the user's line

    if (PracticeInfo.currentPracticeModule && PracticeInfo.currentPracticeModule.handlePointerUp) {
        PracticeInfo.currentPracticeModule.handlePointerUp(e);
    }
});

// Restart the current practice mode when any key is pressed
document.addEventListener('keydown', () => {
    if (PracticeInfo.currentPracticeMode) {
        PracticeInfo.loadPracticeMode(PracticeInfo.currentPracticeMode); // Restart the practice mode
    }
});