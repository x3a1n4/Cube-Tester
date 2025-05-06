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

        // Dynamically load and execute the respective practice mode
        PracticeInfo.currentPracticeMode = button.textContent.trim().toLowerCase().replace(/\s+/g, '-'); // Convert button text to file name

        PracticeInfo.loadPracticeMode(PracticeInfo.currentPracticeMode);
    });
});

function updateFloatingInfo(text) {
    const floatingInfo = document.getElementById('floating-info');
    floatingInfo.textContent = text; // Update the text content
    floatingInfo.style.display = 'flex'; // Make it visible
}