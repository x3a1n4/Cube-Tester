// this holds all of the practice logic
let currentPracticeMode = null; // Store the current practice mode
let currentPracticeModule = null; // Store the currently loaded practice module

// manage stroke count-ensure strokes are a certain minimum length
let strokeCount = 0;

let userLine = [];
let userLines = []; // updated on completion

// Pointer down event
canvas.addEventListener('pointerdown', (e) => {
    userLine = [];

    if (currentPracticeModule && currentPracticeModule.handlePointerDown) {
        currentPracticeModule.handlePointerDown(e);
    }
});

// Pointer move event
canvas.addEventListener('pointermove', (e) => {
    if (!isDrawing) return; // Check if the user is drawing

    // Track the user's line
    userLine.push({ x: e.offsetX, y: e.offsetY });

    if (currentPracticeModule && currentPracticeModule.handlePointerMove) {
        // Call the handlePointerMove function from the module
        currentPracticeModule.handlePointerMove(e);
    }
});

// Pointer up event
canvas.addEventListener('pointerup', (e) => {
    // Stop drawing
    // Get the start-end distance of the line
    if (userLine.length < 2) {
        return; // Ignore short strokes
    }
    
    const startPoint = userLine[0];
    const endPoint = userLine[userLine.length - 1];
    const distance = Math.sqrt((endPoint.x - startPoint.x) ** 2 + (endPoint.y - startPoint.y) ** 2);

    if (distance < minStrokeDistance) {
        return; // Ignore short strokes
    }

    strokeCount++; // Increment stroke count
    userLines.push(userLine); // Store the user's line

    if (currentPracticeModule && currentPracticeModule.handlePointerUp) {
        currentPracticeModule.handlePointerUp(e);
    }
});

// Called when a practice mode is selected or reloaded
function loadPracticeMode(practiceMode) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    userLines = []; // Reset user lines
    strokeCount = 0; // Reset stroke count

    import(`./practice/${practiceMode}.js`)
        .then(module => {
            currentPracticeModule = module; // Store the loaded module
            if (module.startPracticeMode) {
                module.startPracticeMode(); // Call the startPracticeMode function from the module
            }
        })
        .catch(err => {
            console.error(`Failed to load practice mode: ${practiceMode}`, err);
            updateFloatingInfo(`Error: Could not start practice mode for "${practiceMode}"`);
        });
}

// Restart the current practice mode when any key is pressed
document.addEventListener('keydown', () => {
    if (currentPracticeMode) {
        loadPracticeMode(currentPracticeMode); // Restart the practice mode
    }
});