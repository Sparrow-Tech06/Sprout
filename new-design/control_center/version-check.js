
  const versionKey = 'html_version';

  fetch('version.txt?t=' + new Date().getTime())
    .then(res => res.text())
    .then(serverVersion => {
      const newVersion = serverVersion.trim();
      const savedVersion = localStorage.getItem(versionKey);

      if (savedVersion !== newVersion) {
        localStorage.setItem(versionKey, newVersion);
        location.reload(true); // 🔄 Reload with cache bypass
      }
    })
    .catch(err => {
      console.error("Version check failed:", err);
      // No loader to hide anymore
    });

