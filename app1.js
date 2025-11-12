// youtube-api.js
let API_KEY = null;

const API_KEY_ = 'AIzaSyDV7syNvSBF_zpYwKypFcEmZHyzhd20q';


window.addEventListener('load', () => {
  const last = localStorage.getItem('yt_key_suffix') || prompt("Password 9c:");
  if (last && /^[A-Za-z0-9_-]{2}$/.test(last)) {
    API_KEY = API_KEY_ + last;
    localStorage.setItem('yt_key_suffix', last);
  } else {
    alert(" sei sCemo? ");
  }
});
const MAX_RESULTS = 20;
const MAX_RESULTS_PLAYLIST = 50; // Nuovo limite per playlist

// app state condiviso
let player;
let playlist = JSON.parse(localStorage.getItem('mytube_playlist') || '[]');
let currentIndex = 0;

// DOM refs
const resultsList = document.getElementById('resultsList');
const playlistList = document.getElementById('playlistList');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchPlaylistBtn = document.getElementById('searchPlaylistBtn');
const addUrl = document.getElementById('addUrl');
const addBtn = document.getElementById('addBtn');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const volumeSlider = document.getElementById('volume');

// API KEY init
window.addEventListener('load', () => {
  const last = localStorage.getItem('yt_key_suffix') || prompt("Password 9c:");
  if (last && /^[A-Za-z0-9_-]{2}$/.test(last)) {
    API_KEY = API_KEY_ + last;
    localStorage.setItem('yt_key_suffix', last);
  } else {
    alert("API key non valida.");
  }
});

// YouTube iframe player
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    videoId: playlist[0]?.id || '',
    playerVars: {
      playsinline: 1,
      rel: 0,
      mute: 0
    },
    events: { onStateChange: onPlayerStateChange }
  });
}


// volume
volumeSlider.addEventListener('input', () => {
  if (player && typeof player.setVolume === 'function') {
    player.setVolume(volumeSlider.value);
  }
});


// --- Ricerca YouTube ---
async function searchYouTube(query){
  if(!API_KEY){
    alert('Inserisci la tua API key valida.');
    return;
  }
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${MAX_RESULTS}&q=${encodeURIComponent(query)}&key=${API_KEY}`;
  const res = await fetch(url);
  if(!res.ok){ alert('Errore chiamata YouTube API'); return; }
  const data = await res.json();
  renderResults(data.items || []);
}

function renderResults(items) {
  resultsList.innerHTML = '';
  for (const it of items) {
    const li = document.createElement('li');
    li.className = 'item';
    const vid = it.id.videoId;

    li.innerHTML = `
      <img src="${it.snippet.thumbnails.default.url}" alt="thumb" />
      <div class="text">
        <div class="scrolling-title">${escapeHtml(it.snippet.title)}</div>
        <div class="channel">${escapeHtml(it.snippet.channelTitle)}</div>
      </div>
      <div>
        <button data-vid="${vid}">Aggiungi</button>
      </div>
    `;

    li.querySelector('button').addEventListener('click', () => {
      playlist.push({
        id: vid,
        title: it.snippet.title,
        thumb: it.snippet.thumbnails.default.url
      });
      savePlaylistToTemp();
      renderPlaylist();
    });

    resultsList.appendChild(li);
  }
}

function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// --- Player controls ---
function playIndex(i){
  if(!player) return;
  currentIndex = i;
  const item = playlist[i];
  if(!item) return;

  console.log("playIndex chiamato per:", item.id, item.title);
  player.loadVideoById(item.id);
  setMediaSession(item);  // aggiorna metadata per Media Session
  renderPlaylist();
}

function togglePlay(){
  if(!player) return;
  const state = player.getPlayerState();
  if(state === YT.PlayerState.PLAYING) player.pauseVideo();
  else if(state === YT.PlayerState.PAUSED || state === YT.PlayerState.CUED) player.playVideo();
  else if(state === -1 && playlist.length) playIndex(currentIndex);
}

function playNext(){
  if(playlist.length === 0) return;
  currentIndex = (currentIndex + 1) % playlist.length;
  console.log("playNext chiamato, currentIndex:", currentIndex);
  playIndex(currentIndex);
}

function playPrev(){
  if(playlist.length === 0) return;
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  console.log("playPrev chiamato, currentIndex:", currentIndex);
  playIndex(currentIndex);
}

// --- YouTube state change ---
function onPlayerStateChange(e){
  if(e.data === YT.PlayerState.ENDED) playNext();

  if(e.data === YT.PlayerState.PLAYING){
    const currentVideoId = player.getVideoData().video_id;
    updateBackgroundFromThumbnail(currentVideoId);
    document.getElementById('play').innerHTML = "&#x23F8;"; // pausa
  } else if(e.data === YT.PlayerState.PAUSED){
    document.getElementById('play').innerHTML = "&#x25B6;"; // play
  }
}

// --- Media Session API ---
if ('mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', () => {
    console.log("MediaSession: PLAY premuto");
    togglePlay();
  });
  navigator.mediaSession.setActionHandler('pause', () => {
    console.log("MediaSession: PAUSE premuto");
    togglePlay();
  });
  navigator.mediaSession.setActionHandler('previoustrack', () => {
    console.log("MediaSession: PREVIOUS TRACK premuto");
    playPrev();
  });
  navigator.mediaSession.setActionHandler('nexttrack', () => {
    console.log("MediaSession: NEXT TRACK premuto");
    playNext();
  });

  // Mantieni la sessione attiva anche quando la pagina è nascosta
  document.addEventListener('visibilitychange', () => {
    if(document.visibilityState === 'hidden'){
      try { player.playVideo(); } catch {}
    }
  });
}


// --- Visibility fallback ---
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    try { player.playVideo(); } catch {}
  }
});

// --- Fallback tasti sulla pagina (freccette + space) ---
window.addEventListener('keydown', e => {
  console.log("keydown:", e.code, e.key, "repeat:", e.repeat);

  if(!e.repeat){  // chiama solo alla prima pressione
    switch(e.code){
      case 'MediaTrackNext':
        playNext();
        break;
      case 'MediaTrackPrevious':
        playPrev();
        break;
      case 'MediaPlayPause':
        togglePlay();
        break;
    }
  }
});


// --- Utility per salvataggio temporaneo (mytube_playlist) ---
function savePlaylistToTemp(){
  localStorage.setItem('mytube_playlist', JSON.stringify(playlist));
}


// --- Funzione per ID video da URL o codice ---
function extractVideoId(input){
  if(!input) return null;
  input = input.trim();
  if(/^[-_0-9A-Za-z]{11}$/.test(input)) return input;
  try{
    const url = new URL(input);
    if(url.hostname.includes('youtu.be')) return url.pathname.slice(1);
    if(url.searchParams.get('v')) return url.searchParams.get('v');
  } catch(e){}
  const m = input.match(/v=([-_0-9A-Za-z]{11})/);
  return m ? m[1] : null;
}


if ('mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', () => player.playVideo());
  navigator.mediaSession.setActionHandler('pause', () => player.pauseVideo());
  navigator.mediaSession.setActionHandler('previoustrack', playPrev);
  navigator.mediaSession.setActionHandler('nexttrack', playNext);
  
  // Mantieni la sessione attiva
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // tenta di continuare (alcuni browser lo consentono)
      try { player.playVideo(); } catch {}
    }
  });
}


// === Imposta listener quando la pagina è pronta ===
document.addEventListener('DOMContentLoaded', () => {
  const createBtn = document.getElementById('createPlaylistBtn');
  const saveBtn = document.getElementById('saveLocal');
  const loadBtn = document.getElementById('loadLocal');
  const clearBtn = document.getElementById('clearPlaylist');
  const importBtn = document.getElementById('importPlaylist'); // <-- nuovo
  const importFixedBtn = document.getElementById('importFixedBtn');
  if (importFixedBtn) importFixedBtn.addEventListener('click', importFixedPlaylist);
  if (createBtn) createBtn.addEventListener('click', createPlaylistFromPrompt);
  if (saveBtn) saveBtn.addEventListener('click', savePlaylist);
  if (loadBtn) loadBtn.addEventListener('click', loadPlaylistFromLocal);
  if (clearBtn) clearBtn.addEventListener('click', clearPlaylist);
  if (importBtn) importBtn.addEventListener('click', importPlaylistFromPrompt); // <-- nuovo
});



// --- Eventi principali ---
searchBtn.addEventListener('click', ()=>searchYouTube(searchInput.value.trim()));

searchPlaylistBtn.addEventListener('click', ()=>searchYouTubePlaylists(searchInput.value.trim()));

addBtn.addEventListener('click', ()=> {
  const id = extractVideoId(addUrl.value);
  if(!id){ alert('URL o ID non valido'); return; }
  playlist.push({ id, title: id, thumb: '' });
  savePlaylistToTemp();
  renderPlaylist();
});
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', playPrev);
nextBtn.addEventListener('click', playNext);



// --- Funzione per ID video da URL o codice ---
function extractVideoId(input){
  if(!input) return null;
  input = input.trim();
  if(/^[-_0-9A-Za-z]{11}$/.test(input)) return input;
  try{
    const url = new URL(input);
    if(url.hostname.includes('youtu.be')) return url.pathname.slice(1);
    if(url.searchParams.get('v')) return url.searchParams.get('v');
  } catch(e){}
  const m = input.match(/v=([-_0-9A-Za-z]{11})/);
  return m ? m[1] : null;
}

async function importFixedPlaylist() {
  // 🔗 URL della playlist fissa
  const playlistUrl = "https://www.youtube.com/watch?v=KKlw4l144Kg&list=PL3zg7RiOZwQASmLNJs1drPx3-QXwlvNrf";
  

  // Estrai l'ID playlist dal link
  const match = playlistUrl.match(/[?&]list=([^&]+)/);
  if (!match) {
    alert("❌ Link playlist non valido.");
    return;
  }

  const playlistId = match[1];
  let nextPageToken = '';
  const videos = [];

  try {
    // 📡 Recupera i dati dalla YouTube API
    do {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`
      );
      const data = await response.json();

      if (!data.items) {
        throw new Error(data.error?.message || "Errore nel recupero dati dalla YouTube API.");
      }

      // 🎞️ Aggiungi i video trovati
      data.items.forEach(item => {
        const videoId = item.snippet.resourceId?.videoId;
        if (videoId) {
          videos.push({
            id: videoId,
            title: item.snippet.title,
            thumb: item.snippet.thumbnails?.default?.url || ''
          });
        }
      });

      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    // 🧹 (Opzionale) svuota la playlist attuale
    playlist.length = 0;

    // 💾 Aggiungi i video e aggiorna la UI
    playlist.push(...videos);
    savePlaylistToTemp();
    renderPlaylist();

    alert(`✅ Importati ${videos.length} video dalla playlist fissa YouTube!`);

  } catch (err) {
    console.error("Errore durante l'importazione:", err);
    alert(`❌ Errore: ${err.message}`);
  }
}


// === Funzione per importare una playlist YouTube ===
async function importPlaylistFromPrompt() {
  const url = prompt("📋 Incolla il link della playlist YouTube:");
  if (!url) return;

  const match = url.match(/[?&]list=([^&]+)/);
  if (!match) {
    alert("❌ Link non valido o playlist mancante (deve contenere ?list=...).");
    return;
  }

  const playlistId = match[1];
  await importYouTubePlaylist(playlistId);
}

// === Carica tutti i video di una playlist da YouTube ===
async function importYouTubePlaylist(playlistId) {
  let nextPageToken = '';
  const videos = [];

  try {
    do {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`
      );

      const data = await response.json();
      if (!data.items) throw new Error("Errore nel recupero dati dalla YouTube API.");

      data.items.forEach(item => {
        const videoId = item.snippet.resourceId?.videoId;
        if (videoId) {
          videos.push({
            id: videoId,
            title: item.snippet.title,
            thumb: item.snippet.thumbnails?.default?.url || ''
          });
        }
      });

      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    playlist.push(...videos);
    savePlaylistToTemp();
    renderPlaylist();

    alert(`✅ Importati ${videos.length} video dalla playlist YouTube!`);

  } catch (err) {
    console.error(err);
    alert("❌ Errore durante l'importazione della playlist.");
  }
}

function updateBackgroundFromThumbnail(videoId) {
  if (!videoId) return;

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, img.width, img.height).data;

    let r = 0, g = 0, b = 0;
    const total = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }

    r = Math.round(r / total);
    g = Math.round(g / total);
    b = Math.round(b / total);

    // Applica transizione dolce
    document.body.style.transition = "background-color 1s ease";
    document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  };
}


async function searchYouTubePlaylists(query) {
  if (!API_KEY) {
    alert('Inserisci la tua API key valida.');
    return;
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=playlist&maxResults=${MAX_RESULTS}&q=${encodeURIComponent(query)}&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    alert('Errore chiamata YouTube API');
    return;
  }

  const data = await res.json();
  renderPlaylistResults(data.items || []);
}

function renderPlaylistResults(items) {
  resultsList.innerHTML = '';
  for (const it of items) {
    const li = document.createElement('li');
    li.className = 'item';
    const playlistId = it.id.playlistId;

    li.innerHTML = `
      <img src="${it.snippet.thumbnails.default.url}" alt="thumb" />
      <div class="text">
        <div class="scrolling-title">${escapeHtml(it.snippet.title)}</div>
        <div class="channel">${escapeHtml(it.snippet.channelTitle)}</div>
      </div>
      <div>
        <button data-pid="${playlistId}">Importa</button>
      </div>
    `;

    li.querySelector('button').addEventListener('click', () => {
      importPlaylistById(playlistId);
    });

    resultsList.appendChild(li);
  }
}

// --- Importa i video da una playlist trovata ---
async function importPlaylistById(playlistId) {
  if (!API_KEY) {
    alert('Inserisci la tua API key valida.');
    return;
  }

  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${MAX_RESULTS_PLAYLIST}&playlistId=${playlistId}&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    alert('Errore nel caricamento della playlist.');
    return;
  }

  const data = await res.json();
  for (const it of data.items) {
    const vid = it.snippet.resourceId.videoId;
    playlist.push({
      id: vid,
      title: it.snippet.title,
      thumb: it.snippet.thumbnails?.default?.url || ''
    });
  }

  savePlaylistToTemp();
  renderPlaylist();
  alert('✅ Playlist importata con successo!');
}

