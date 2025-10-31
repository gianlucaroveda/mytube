console.log("✅ Script caricato correttamente");

  // Recupero il bottone
  const createPlaylistBtn = document.getElementById('createPlaylistBtn');
  console.log("🔍 Bottone trovato?", !!createPlaylistBtn);

  // Funzione per creare la playlist
  function createPlaylistFromPrompt() {
    console.log("🎯 Click ricevuto su 'Crea nuova playlist'");
    const name = prompt("Inserisci il nome della nuova playlist (no caratteri / o null):");
    if (!name) {
      console.log("⚠️ Prompt annullato o vuoto");
      return;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      alert('Nome non valido.');
      return;
    }
    if (localStorage.getItem(trimmed) !== null) {
      const ok = confirm(`Esiste già una chiave chiamata "${trimmed}". Sovrascriverla?`);
      if (!ok) return;
    }
    localStorage.setItem(trimmed, JSON.stringify([]));
    console.log(`💾 Playlist "${trimmed}" salvata in localStorage`);
    alert(`Playlist "${trimmed}" creata.`);
  }

  // Aggiunta evento click
  if (createPlaylistBtn) {
    createPlaylistBtn.addEventListener('click', createPlaylistFromPrompt);
    console.log("✅ Listener click aggiunto al bottone");
  } else {
    console.error("❌ Bottone 'createPlaylistBtn' non trovato nel DOM");
  }



  function renderPlaylist(){
  const playlistList = document.getElementById('playlistList');
  playlistList.innerHTML = '';
  playlist.forEach((p, idx) => {
    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `
      <img src="${p.thumb||''}" alt="thumb" />
      <div style="flex:1">
        <div style="font-weight:600">${escapeHtml(p.title||p.id)}</div>
        <div style="font-size:0.85rem;color:#555">#${idx+1}</div>
      </div>
      <div>
        <button class="play" data-idx="${idx}">▶</button>
        <button class="del secondary" data-idx="${idx}">✖</button>
      </div>
    `;
    li.querySelector('.play').addEventListener('click', ()=> playIndex(idx));
    li.querySelector('.del').addEventListener('click', ()=> {
      playlist.splice(idx,1);
      savePlaylistToTemp();
      renderPlaylist();
    });
    playlistList.appendChild(li);
  });
}

// --- Crea una nuova playlist nel localStorage ---
function createPlaylistFromPrompt() {
  const name = prompt("Inserisci il nome della nuova playlist:");
  if (!name) return;
  const trimmed = name.trim();
  if (!trimmed) {
    alert('Nome non valido.');
    return;
  }
  if (localStorage.getItem(trimmed) !== null) {
    const ok = confirm(`Esiste già una playlist "${trimmed}". Sovrascriverla?`);
    if (!ok) return;
  }
  localStorage.setItem(trimmed, JSON.stringify([]));
  alert(`✅ Playlist "${trimmed}" creata.`);
}

// --- Salva la coda attuale in una playlist esistente (append) ---
function savePlaylist() {
  const currentQueue = JSON.parse(localStorage.getItem('mytube_playlist') || '[]');
  if (currentQueue.length === 0) {
    alert("La coda è vuota, nulla da salvare.");
    return;
  }

  const keys = Object.keys(localStorage).filter(k => {
    try { JSON.parse(localStorage.getItem(k)); return true; }
    catch { return false; }
  });

  if (keys.length === 0) {
    alert("Non esistono playlist salvate. Creane una prima!");
    return;
  }

  const choice = prompt(
    "In quale playlist vuoi salvare la coda?\n\n" +
    keys.map((k, i) => `${i + 1}) ${k}`).join("\n")
  );
  if (!choice) return;

  let selected;
  if (!isNaN(choice) && choice > 0 && choice <= keys.length) {
    selected = keys[choice - 1];
  } else {
    selected = choice.trim();
  }

  if (!localStorage.getItem(selected)) {
    alert(`La playlist "${selected}" non esiste.`);
    return;
  }

  const target = JSON.parse(localStorage.getItem(selected));
  const merged = [...target, ...currentQueue];
  localStorage.setItem(selected, JSON.stringify(merged));

  alert(`✅ ${currentQueue.length} elementi aggiunti alla playlist "${selected}".`);
  console.log(`💾 Playlist "${selected}" aggiornata con ${currentQueue.length} nuovi elementi.`);
}

// --- Carica la coda temporanea mytube_playlist ---
function loadPlaylistFromLocal(){
  playlist = JSON.parse(localStorage.getItem('mytube_playlist') || '[]');
  renderPlaylist();
}

// --- Svuota la playlist attuale ---
function clearPlaylist(){
  playlist = [];
  savePlaylistToTemp();
  renderPlaylist();
}

// --- Event binding ---
document.addEventListener('DOMContentLoaded', () => {
  const createBtn = document.getElementById('createPlaylistBtn');
  const saveBtn = document.getElementById('saveLocal');
  const loadBtn = document.getElementById('loadLocal');
  const clearBtn = document.getElementById('clearPlaylist');

  if (createBtn) createBtn.addEventListener('click', createPlaylistFromPrompt);
  if (saveBtn) saveBtn.addEventListener('click', savePlaylist);
  if (loadBtn) loadBtn.addEventListener('click', ()=> { loadPlaylistFromLocal(); alert('Playlist caricata'); });
  if (clearBtn) clearBtn.addEventListener('click', clearPlaylist);
});

// --- Helper HTML escape ---
function escapeHtml(s){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}


function loadPlaylistFromSelection() {
  const keys = Object.keys(localStorage).filter(k => {
    try {
      JSON.parse(localStorage.getItem(k));
      return true;
    } catch {
      return false;
    }
  });

  if (keys.length === 0) {
    alert("❌ Nessuna playlist salvata trovata.");
    return;
  }

  // Mostra all'utente le playlist disponibili
  const choice = prompt(
    "Quale playlist vuoi caricare?\n\n" +
    keys.map((k, i) => `${i + 1}) ${k}`).join("\n")
  );

  if (!choice) return;

  let selected;
  // Permetti sia il numero che il nome diretto
  if (!isNaN(choice) && choice > 0 && choice <= keys.length) {
    selected = keys[choice - 1];
  } else {
    selected = choice.trim();
  }

  const data = localStorage.getItem(selected);
  if (!data) {
    alert(`⚠️ La playlist "${selected}" non esiste.`);
    return;
  }

  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) throw new Error();

    // Salva come coda attuale
    localStorage.setItem('mytube_playlist', JSON.stringify(parsed));
    alert(`✅ Playlist "${selected}" caricata (${parsed.length} elementi).`);

    // Aggiorna la variabile globale e la UI
    if (typeof playlist !== 'undefined') {
      playlist = parsed;
      if (typeof renderPlaylist === 'function') renderPlaylist();
    }
  } catch (e) {
    alert("❌ Errore nel caricamento della playlist selezionata.");
  }
}

// Aggiunge listener al bottone “Carica locale”
document.addEventListener('DOMContentLoaded', () => {
  const loadLocalBtn = document.getElementById('loadLocal');
  if (loadLocalBtn) {
    loadLocalBtn.addEventListener('click', loadPlaylistFromSelection);
  }
});


function overwritePlaylist() {
  const currentQueue = JSON.parse(localStorage.getItem('mytube_playlist') || '[]');
  if (currentQueue.length === 0) {
    alert("⚠️ La coda è vuota, nulla da salvare.");
    return;
  }

  const keys = Object.keys(localStorage).filter(k => {
    try {
      JSON.parse(localStorage.getItem(k));
      return true;
    } catch {
      return false;
    }
  });

  if (keys.length === 0) {
    alert("❌ Non ci sono playlist salvate. Creane una prima!");
    return;
  }

  // Mostra le playlist esistenti
  const choice = prompt(
    "Quale playlist vuoi sovrascrivere?\n⚠️ Verrà sostituita completamente!\n\n" +
    keys.map((k, i) => `${i + 1}) ${k}`).join("\n")
  );

  if (!choice) return;

  let selected;
  if (!isNaN(choice) && choice > 0 && choice <= keys.length) {
    selected = keys[choice - 1];
  } else {
    selected = choice.trim();
  }

  if (!localStorage.getItem(selected)) {
    alert(`⚠️ La playlist "${selected}" non esiste.`);
    return;
  }

  if (!confirm(`Sei sicuro di voler sovrascrivere "${selected}" con la coda attuale?`)) return;

  localStorage.setItem(selected, JSON.stringify(currentQueue));
  alert(`✅ Playlist "${selected}" sovrascritta con ${currentQueue.length} elementi.`);
}

// Listener per il nuovo bottone
document.addEventListener('DOMContentLoaded', () => {
  const overwriteBtn = document.getElementById('overwriteLocal');
  if (overwriteBtn) {
    overwriteBtn.addEventListener('click', overwritePlaylist);
  }
});