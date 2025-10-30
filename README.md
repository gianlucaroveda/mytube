# MyTube (static)

Static project ready for GitHub Pages.

Features:
- Search YouTube (requires YouTube Data API key)
- Create and manage local playlists (saved to localStorage)
- Player using YouTube IFrame API with next/prev controls
- Media Session API for lock-screen controls
- PWA manifest and basic service worker

## Quick start
1. Replace `YOUR_API_KEY` in `app.js` with your YouTube Data API key to enable search.
2. Commit the files to a repo named `username.github.io` (or any repo + use Pages from branch `main` / `gh-pages`).
3. Push to GitHub. Pages will serve the site.

## Notes
- GitHub Pages is static; the page cannot write files back to the repo. Playlists are saved in the browser's localStorage.
- For cross-device sync you can later add a backend or Firebase.
