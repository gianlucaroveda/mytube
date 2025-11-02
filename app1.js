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
const MAX_RESULTS = 8;

// app state condiviso
let player;
let playlist = JSON.parse(localStorage.getItem('mytube_playlist') || '[]');
let currentIndex = 0;

// DOM refs
const resultsList = document.getElementById('resultsList');
const playlistList = document.getElementById('playlistList');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const addUrl = document.getElementById('addUrl');
const addBtn = document.getElementById('addBtn');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

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
      mute: 1
    },
    events: { onStateChange: onPlayerStateChange }
  });
}


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

function renderResults(items){
  resultsList.innerHTML = '';
  for(const it of items){
    const li = document.createElement('li');
    li.className = 'item';
    const vid = it.id.videoId;
    li.innerHTML = `
      <img src="${it.snippet.thumbnails.default.url}" alt="thumb" />
      <div style="flex:1">
        <div style="font-weight:600">${escapeHtml(it.snippet.title)}</div>
        <div style="font-size:0.85rem;color:#555">${escapeHtml(it.snippet.channelTitle)}</div>
      </div>
      <div>
        <button data-vid="${vid}">Aggiungi</button>
      </div>
    `;
    li.querySelector('button').addEventListener('click', ()=> {
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
  player.loadVideoById(item.id);
  setMediaSession(item);
}

function togglePlay(){
  if(!player) return;
  const state = player.getPlayerState();
  if(state === YT.PlayerState.PLAYING) player.pauseVideo();
  else if(state === YT.PlayerState.PAUSED || state === YT.PlayerState.CUED) player.playVideo();
  else if(state === -1 && playlist.length) playIndex(currentIndex);
}

function playNext(){ currentIndex = (currentIndex+1) % playlist.length; playIndex(currentIndex); }
function playPrev(){ currentIndex = (currentIndex-1+playlist.length) % playlist.length; playIndex(currentIndex); }

function onPlayerStateChange(e){
  if(e.data === YT.PlayerState.ENDED) playNext();
  if (e.data === YT.PlayerState.PLAYING) {
  const currentVideoId = player.getVideoData().video_id;
  updateBackgroundFromThumbnail(currentVideoId);
}
}

// --- Media session (Android integration) ---
function setMediaSession(item){
  if('mediaSession' in navigator){
    navigator.mediaSession.metadata = new MediaMetadata({
      title: item.title || '',
      artist: 'YouTube',
      artwork: [{ src: item.thumb || '', sizes: '96x96', type: 'image/png' }]
    });
    navigator.mediaSession.setActionHandler('play', ()=>player.playVideo());
    navigator.mediaSession.setActionHandler('pause', ()=>player.pauseVideo());
    navigator.mediaSession.setActionHandler('previoustrack', playPrev);
    navigator.mediaSession.setActionHandler('nexttrack', playNext);
  }
}

// --- Utility per salvataggio temporaneo (mytube_playlist) ---
function savePlaylistToTemp(){
  localStorage.setItem('mytube_playlist', JSON.stringify(playlist));
}

// --- Eventi principali ---
searchBtn.addEventListener('click', ()=>searchYouTube(searchInput.value.trim()));
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