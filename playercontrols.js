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
function setMediaSession(item){
  if('mediaSession' in navigator){
    navigator.mediaSession.metadata = new MediaMetadata({
      title: item.title || '',
      artist: 'YouTube',
      artwork: [{ src: item.thumb || '', sizes: '96x96', type: 'image/png' }]
    });

    // MediaSession handlers
    navigator.mediaSession.setActionHandler('play', ()=> {
      console.log("MediaSession: PLAY");
      player.playVideo();
    });

    navigator.mediaSession.setActionHandler('pause', ()=> {
      console.log("MediaSession: PAUSE");
      player.pauseVideo();
    });

    navigator.mediaSession.setActionHandler('previoustrack', ()=> {
      console.log("MediaSession: PREVIOUS TRACK");
      playPrev();
    });

    navigator.mediaSession.setActionHandler('nexttrack', ()=> {
      console.log("MediaSession: NEXT TRACK");
      playNext();
    });
  }
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
      case 'ArrowRight':
      case 'PageDown':
        playNext();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        playPrev();
        break;
      case 'Space':
        e.preventDefault();
        togglePlay();
        break;
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