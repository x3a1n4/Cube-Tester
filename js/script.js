let currentPracticeMode = null; // Store the current practice mode
let currentPracticeModule = null; // Store the currently loaded practice module

function toggleSubmenu(id) {
    const submenu = document.getElementById(id);
    const button = submenu.previousElementSibling; // Get the button that toggled this submenu

    if (submenu.style.maxHeight) {
        submenu.style.maxHeight = null; // Collapse the submenu
        button.classList.remove('open'); // Remove the 'open' class to reset chevron rotation
    } else {
        submenu.style.display = "block"; // set to block to get scrollHeight
        const height = submenu.scrollHeight;
        submenu.style.display = "";

        submenu.style.maxHeight = height + "px"; // Expand the submenu
        button.classList.add('open'); // Add the 'open' class to rotate the chevron
    }
}

const canvas = document.getElementById('drawing-canvas');

// Add event listeners for practice module interactions
canvas.addEventListener('pointerdown', (e) => {
    if (currentPracticeModule && currentPracticeModule.handlePointerDown) {
        currentPracticeModule.handlePointerDown(e);
    }
});

canvas.addEventListener('pointermove', (e) => {
    if (currentPracticeModule && currentPracticeModule.handlePointerMove) {
        currentPracticeModule.handlePointerMove(e);
    }
});

canvas.addEventListener('pointerup', (e) => {
    if (currentPracticeModule && currentPracticeModule.handlePointerUp) {
        currentPracticeModule.handlePointerUp(e);
    }

    // Show the restart button
    const restartButton = document.getElementById('restart-button');
    restartButton.style.display = 'block';
});

// Handle submenu button clicks
document.querySelectorAll('.submenu button').forEach(button => {
    button.addEventListener('click', () => {
        if (button.classList.contains('selected')) {
            // If the button is already selected, do nothing
            return;
        }

        // Remove 'selected' class from all buttons
        document.querySelectorAll('.submenu button').forEach(btn => {
            btn.classList.remove('selected');
            btn.style.backgroundColor = ""; // Reset background color
        });

        // Add 'selected' class to the clicked button
        button.classList.add('selected');
        button.style.backgroundColor = button.getAttribute('data-colour'); // Apply data-colour

        // Position the settings icon next to the selected button
        const settingsIcon = document.querySelector('.settings-icon');
        const buttonRect = button.getBoundingClientRect();
        const navRect = document.querySelector('nav').getBoundingClientRect();

        // Calculate the position of the settings icon relative to the nav
        settingsIcon.style.top = `${buttonRect.top - navRect.top + 3}px`;
        settingsIcon.style.left = `${buttonRect.left - navRect.left - 5}px`; // Add some margin
        settingsIcon.style.opacity = 1; // Make the icon visible

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dynamically load and execute the respective practice mode
        currentPracticeMode = button.textContent.trim().toLowerCase().replace(/\s+/g, '-'); // Convert button text to file name

        loadPracticeMode(currentPracticeMode);
    });
});

function loadPracticeMode(practiceMode) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

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

function updateFloatingInfo(text) {
    const floatingInfo = document.getElementById('floating-info');
    floatingInfo.textContent = text; // Update the text content
    floatingInfo.style.display = 'flex'; // Make it visible
}