document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM completamente caricato"); // verifica che l'evento funzioni

  const gotoYTBtn = document.getElementById('gotoYTBtn');
  console.log("Bottone trovato:", gotoYTBtn); // controlla se l'elemento esiste

  if (gotoYTBtn) {
    gotoYTBtn.addEventListener('click', () => {
      console.log("Bottone cliccato!"); // verifica se il click viene intercettato
      window.location.href = "index.html";
    });
  } else {
    console.log("Elemento gotoYTBtn non trovato nel DOM!");
  }
});