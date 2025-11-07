let API_KEY = null;
const API_KEY_ = 'AIzaSyDV7syNvSBF_zpYwKypFcEmZHyzhd20q';

window.addEventListener('load', () => {
  const last = localStorage.getItem('yt_key_suffix') || prompt("Password 9c:");
  if (last && /^[A-Za-z0-9_-]{2}$/.test(last)) {
    API_KEY = API_KEY_ + last;
    localStorage.setItem('yt_key_suffix', last);
  } else {
    alert("API key non valida.");
  }
});
