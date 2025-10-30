// MyTube - app.js
// NOTE: Replace 'YOUR_API_KEY' below with your YouTube Data API key to enable search.


let API_KEY = null;

// chiave parziale salvata nel codice
const API_KEY_ = 'AIzaSyDV7syNvSBF_zpYwKypFcEmZHyzhd20q';

// all’avvio, chiedi le ultime 2 cifre
window.addEventListener('load', () => {
  const last = localStorage.getItem('yt_key_suffix') || prompt("Password 9c:");
  if (last && /^[A-Za-z0-9_-]{2}$/.test(last)) {
    API_KEY = API_KEY_ + last;
    localStorage.setItem('yt_key_suffix', last);
  } else {
    alert(" sei sCemo? ");
  }
});

 // <-- Inserisci la tua chiave
const MAX_RESULTS = 8;

// app state
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
const saveLocalBtn = document.getElementById('saveLocal');
const loadLocalBtn = document.getElementById('loadLocal');
const clearBtn = document.getElementById('clearPlaylist');

// YouTube API
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: playlist[0]?.id || '',
    playerVars: {
      playsinline: 1,
      rel: 0,
      mute: 1 // ✅ evita blocco autoplay
    },
    events: { onStateChange: onPlayerStateChange }
  });
}

// Extract videoId
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

// Search YouTube
async function searchYouTube(query){
  if(!API_KEY || API_KEY === 'YOUR_API_KEY'){
    alert('Inserisci la tua API key in app.js per usare la ricerca.');
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
    li.querySelector('button').addEventListener('click', ()=>{
      playlist.push({ id: vid, title: it.snippet.title, thumb: it.snippet.thumbnails.default.url });
      savePlaylist();
      renderPlaylist();
    });
    resultsList.appendChild(li);
  }
}

function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function renderPlaylist(){
  playlistList.innerHTML = '';
  playlist.forEach((p, idx)=>{
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
    li.querySelector('.play').addEventListener('click', ()=>{ playIndex(idx); });
    li.querySelector('.del').addEventListener('click', ()=>{ playlist.splice(idx,1); savePlaylist(); renderPlaylist(); });
    playlistList.appendChild(li);
  });
}

function savePlaylist(){
  localStorage.setItem('mytube_playlist', JSON.stringify(playlist));
}
function loadPlaylistFromLocal(){
  playlist = JSON.parse(localStorage.getItem('mytube_playlist') || '[]');
  renderPlaylist();
}

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
}

function setMediaSession(item){
  if('mediaSession' in navigator){
    navigator.mediaSession.metadata = new MediaMetadata({
      title: item.title || '',
      artist: 'YouTube',
      album: '',
      artwork: [{ src: item.thumb || '', sizes: '96x96', type: 'image/png' }]
    });
    navigator.mediaSession.setActionHandler('play', ()=>player.playVideo());
    navigator.mediaSession.setActionHandler('pause', ()=>player.pauseVideo());
    navigator.mediaSession.setActionHandler('previoustrack', playPrev);
    navigator.mediaSession.setActionHandler('nexttrack', playNext);
  }
}

// wire events
searchBtn.addEventListener('click', ()=>searchYouTube(searchInput.value.trim()));
addBtn.addEventListener('click', ()=>{
  const id = extractVideoId(addUrl.value);
  if(!id){ alert('URL o ID non valido'); return; }
  playlist.push({ id, title: id, thumb: '' });
  savePlaylist(); renderPlaylist();
});
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', playPrev);
nextBtn.addEventListener('click', playNext);
saveLocalBtn.addEventListener('click', ()=>{ savePlaylist(); alert('Playlist salvata localmente'); });
loadLocalBtn.addEventListener('click', ()=>{ loadPlaylistFromLocal(); alert('Playlist caricata'); });
clearBtn.addEventListener('click', ()=>{ if(confirm('Svuotare la playlist?')){ playlist=[]; savePlaylist(); renderPlaylist(); } });

// initial render
renderPlaylist();
