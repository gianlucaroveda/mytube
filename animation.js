const resultsDiv = document.getElementById("results");
const checkbox = document.getElementById("checkbox");

checkbox.addEventListener("change", () => {
  resultsDiv.classList.toggle("collapsed", checkbox.checked);
});
