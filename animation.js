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