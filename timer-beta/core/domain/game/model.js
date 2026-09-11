const PLAYERS_MIN = 3;
const PLAYERS_MAX = 5;
const PLAYERS_DEFAULT = 4;

const CHAPTERS_MIN = 1;
const CHAPTERS_MAX = 4;
const CHAPTERS_DEFAULT = 4;

const DIFFICULTY_VALUES = ['facile', 'normal', 'difficile'];
const DIFFICULTY_DEFAULT = 'normal';

class Game {
    constructor({
        state = GAME_STATE.NOT_STARTED,
        players = PLAYERS_DEFAULT,
        difficulty = DIFFICULTY_DEFAULT,
        chapters,
    } = {}) {
        this.state = state;
        this.settings = { players, difficulty };
        this.chapters = chapters;
    }

    chooseDifficulty(difficulty) {
        this.settings.difficulty = difficulty;
    }

    addPlayer() {
        const players = this.settings.players ?? PLAYERS_MIN;
        if (players >= PLAYERS_MAX) return;
        this.settings.players = players + 1;
    }

    removePlayer() {
        const players = this.settings.players ?? PLAYERS_MIN;
        if (players <= PLAYERS_MIN) return;
        this.settings.players = players - 1;
    }

    addChapter() {
        const chapters = this.chapters ?? [];
        if (chapters.length >= CHAPTERS_MAX) return;
        this.chapters = [...chapters, new Chapter(chapters.length + 1)];
    }

    removeChapter() {
        const chapters = this.chapters ?? [];
        if (chapters.length <= CHAPTERS_MIN) return;
        this.chapters = chapters.slice(0, -1);
    }

    start() {
        this.state = GAME_STATE.STARTED;
        this.currentChapter = 0;
    }
}
