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

