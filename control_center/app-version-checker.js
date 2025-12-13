const webVersion = "13"; // Website-required version

function checkVersion() {
     const appVersion = Android.getAppVersion(); 
    // const appVersion = "5.0"; // For demo/testing only

    if (appVersion !== webVersion) {
        redirectToUpdatePage();
    }
}

function redirectToUpdatePage() {
    // Redirect only if already not on updates.html
    if (!window.location.href.includes("control_center/updates.html")) {
        window.location.href = "control_center/updates.html";
    }
}

// Run on load
window.onload = () => {
    checkVersion();

    // Check every 1 sec
    setInterval(checkVersion, 1000);
};
