// === YouTube Data API e Playlist dinamica ===

// Stato globale
let player;
let playlist = [];
let currentIndex = 0;

// YouTube iframe API
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    videoId: '',
    playerVars: { playsinline: 1, rel: 0 },
    events: { onStateChange: onPlayerStateChange }
  });
}

// Controlli base
document.getElementById('prev').addEventListener('click', () => playIndex(currentIndex - 1));
document.getElementById('next').addEventListener('click', () => playIndex(currentIndex + 1));
document.getElementById('play').addEventListener('click', () => {
  if (!player) return;
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) player.pauseVideo();
  else player.playVideo();
});
document.getElementById('volume').addEventListener('input', e => {
  if (player) player.setVolume(e.target.value);
});

// === Funzione per importare gli ultimi 10 video del canale ===
async function importLatestVideos() {
  const channelHandle = "@TheGametimeHighlights";
  const maxResults = 10;

  if (!API_KEY) {
    alert("⚠️ API Key non inizializzata.");
    return;
  }

  try {
    // 1️⃣ Trova l'ID del canale a partire dall'handle
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${channelHandle}&key=${API_KEY}`
    );
    const channelData = await channelRes.json();
    const channelId = channelData.items?.[0]?.id;
    if (!channelId) throw new Error("Canale non trovato.");

    // 2️⃣ Recupera i video più recenti
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${API_KEY}`
    );
    const data = await searchRes.json();

    playlist = data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumb: item.snippet.thumbnails?.medium?.url || ''
    }));

    renderPlaylist();
    playIndex(0);
  } catch (err) {
    console.error(err);
    alert("❌ Errore durante l'importazione dei video.");
  }
}

// === Rendering della lista ===
function renderPlaylist() {
  const list = document.getElementById('playlistList');
  list.innerHTML = '';

  playlist.forEach((p, idx) => {
    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `
      <img src="${p.thumb}" alt="thumb" />
      <div class="center-content">
        <div class="scrolling-title">${p.title}</div>
        <div class="index-label">#${idx + 1}</div>
      </div>
      <button class="play">▶</button>
    `;
    li.querySelector('.play').addEventListener('click', () => playIndex(idx));
    list.appendChild(li);
  });
}

// === Player ===
function playIndex(idx) {
  if (idx < 0 || idx >= playlist.length) return;
  currentIndex = idx;
  player.loadVideoById(playlist[idx].id);
}

// Gestione stati
function onPlayerStateChange(e) {
  if (e.data === YT.PlayerState.ENDED) playIndex(currentIndex + 1);
}

// === Bottone per importare ===
document.getElementById('importChannelBtn').addEventListener('click', importLatestVideos);
