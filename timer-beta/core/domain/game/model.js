const PLAYERS_MIN = 3;
const PLAYERS_MAX = 5;
const PLAYERS_DEFAULT = 4;

const CHAPTERS_MIN = 1;
const CHAPTERS_MAX = 4;
const CHAPTERS_DEFAULT = 4;

const DIFFICULTY_VALUES = ['facile', 'normal', 'difficile'];
const DIFFICULTY_DEFAULT = 'normal';

class Game {
    static DIFFICULTY_MINUTES = {
        facile: 20,
        normal: 15,
        difficile: 10,
    };

    constructor({
        state = GAME_STATE.NOT_STARTED,
        players = PLAYERS_DEFAULT,
        difficulty = DIFFICULTY_DEFAULT,
        chapters,
        currentChapter,
    } = {}) {
        this.state = state;
        this.settings = { players, difficulty };
        this.chapters = chapters;
        this.currentChapter = currentChapter;
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
        this.#computeAndSetTimerDuration();
    }

    #computeAndSetTimerDuration() {
        this.settings.timerDuration = Game.DIFFICULTY_MINUTES[this.settings.difficulty] * 60 * 100;
    }

    loadChapter() {
        const chapter = this.chapters[this.currentChapter];
        chapter.load();
    }

    rollDiceOfFortune() {
        const chapter = this.chapters[this.currentChapter];
        chapter.rollDiceOfFortune();
    }
}
