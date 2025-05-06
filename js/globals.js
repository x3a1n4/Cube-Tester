// Global variables
// Moved here for easy reference
class Globals{
    static canvas = document.getElementById('drawing-canvas');
    static ctx = Globals.canvas.getContext('2d');

    static minPointGenerationDistance = Globals.canvas.width * 0.1; // Minimum distance between points
    static minStrokeDistance = Math.min(Globals.canvas.width * 0.01, 10); // Minimum distance for a stroke to be counted
}
