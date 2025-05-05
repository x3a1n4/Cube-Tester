// Global variables
// Moved here for easy reference
const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');

const minDistance = canvas.width * 0.1; // Minimum distance between points
const minStrokeDistance = Math.min(canvas.width * 0.01, 10); // Minimum distance for a stroke to be counted