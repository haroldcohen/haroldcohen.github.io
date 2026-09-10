const GAME_STORAGE_KEY = 'deadEndGame';

function readGame() {
    try {
        return JSON.parse(sessionStorage.getItem(GAME_STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

function saveGame(game) {
    sessionStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(game));
}
