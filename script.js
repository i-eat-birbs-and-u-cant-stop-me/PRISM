function updateDashboard() {
    // 1. Get the current time data from your Mac
    const now = new Date();
    
    // 2. Extract hours, minutes, and seconds
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    // 3. Format numbers so they always have two digits (e.g., "05" instead of "5")
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    // 4. Combine them into a terminal-style timestamp string
    const timeString = `${hours}:${minutes}:${seconds}`;

    // 5. Inject that time string directly into your greeting widget
    document.getElementById("greeting").innerText = `TIMESTAMP: ${timeString}`;
}

// Run this function instantly when the page loads
updateDashboard();

// Tell the computer to rerun this function every 1000 milliseconds (1 second)
setInterval(updateDashboard, 1000);
