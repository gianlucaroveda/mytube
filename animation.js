document.addEventListener("DOMContentLoaded", () => {
  const toggleSearchAreaBtn = document.getElementById("toggleSearchBtn");
  const searchArea = document.getElementById("searchArea");

  if (toggleSearchAreaBtn && searchArea) {
    toggleSearchAreaBtn.addEventListener("click", () => {
      searchArea.classList.toggle("show");
    });
  }
});
document.getElementById("toggleLinkBtn").addEventListener("click", () => {
  const linkBox = document.getElementById("linkSearch");
  linkBox.classList.toggle("show");
});

document.addEventListener('DOMContentLoaded', () => {
  const gotoHighlightsBtn = document.getElementById('gotoHighlightsBtn');
  if (gotoHighlightsBtn) {
    gotoHighlightsBtn.addEventListener('click', () => {
      window.location.href = "highlights.html";
    });
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const goFullscreen = document.getElementById('goFullscreen');
  if (!goFullscreen) return;

  goFullscreen.addEventListener('click', () => {
    const el = document.documentElement;

    // Controlla se siamo già in fullscreen
    const isFullscreen =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement;

    if (isFullscreen) {
      // Esci dalla modalità fullscreen
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    } else {
      // Entra in modalità fullscreen
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    }
  });
});
