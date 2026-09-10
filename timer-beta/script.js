function saveGameSettings(overrides) {
    const game = readGame();
    game.settings = { ...game.settings, ...overrides };
    saveGame(game);
}

// --- Chapters: AddChapter / RemoveChapter commands -------------------------

const chaptersStepper = document.querySelector('.stepper[data-setting="chapters"]');

function RemoveChapter() {
    const { chapters = [] } = readGame();
    if (chapters.length <= CHAPTERS_MIN) return;

    dispatchDomainEvent('ChapterWasRemoved', {
        chapter: chapters[chapters.length - 1],
    });
}

function renderChaptersStepper(chapters) {
    chaptersStepper.querySelector('.stepper-value').textContent = chapters.length;
    chaptersStepper.querySelector('.stepper-minus').disabled = chapters.length <= CHAPTERS_MIN;
    chaptersStepper.querySelector('.stepper-plus').disabled = chapters.length >= CHAPTERS_MAX;
}

onDomainEvent('ChapterWasAdded', ({ chapter }) => {
    const game = readGame();
    game.chapters = [...(game.chapters || []), chapter];
    saveGame(game);
    renderChaptersStepper(game.chapters);
});

onDomainEvent('ChapterWasRemoved', ({ chapter }) => {
    const game = readGame();
    game.chapters = (game.chapters || []).filter((c) => c.num !== chapter.num);
    saveGame(game);
    renderChaptersStepper(game.chapters);
});

chaptersStepper.querySelector('.stepper-minus').addEventListener('click', RemoveChapter);
chaptersStepper.querySelector('.stepper-plus').addEventListener('click', AddChapter);

function initChapters() {
    const game = readGame();
    if (!game.chapters || game.chapters.length === 0) {
        game.chapters = Array.from({ length: CHAPTERS_DEFAULT }, (_, i) => (
            { num: i + 1, state: CHAPTER_STATE.NOT_STARTED }
        ));
        saveGame(game);
    }
    renderChaptersStepper(game.chapters);
}

initChapters();

// --- Players: AddPlayer / RemovePlayer commands -----------------------------

const playersStepper = document.querySelector('.stepper[data-setting="players"]');
const PLAYERS_MIN = parseInt(playersStepper.dataset.min, 10);
const PLAYERS_MAX = parseInt(playersStepper.dataset.max, 10);

function AddPlayer() {
    const { settings = {} } = readGame();
    const players = settings.players ?? PLAYERS_MIN;
    if (players >= PLAYERS_MAX) return;

    dispatchDomainEvent('PlayerWasAdded', { players: players + 1 });
}

function RemovePlayer() {
    const { settings = {} } = readGame();
    const players = settings.players ?? PLAYERS_MIN;
    if (players <= PLAYERS_MIN) return;

    dispatchDomainEvent('PlayerWasRemoved', { players: players - 1 });
}

function renderPlayersStepper(players) {
    playersStepper.querySelector('.stepper-value').textContent = players;
    playersStepper.querySelector('.stepper-minus').disabled = players <= PLAYERS_MIN;
    playersStepper.querySelector('.stepper-plus').disabled = players >= PLAYERS_MAX;
}

onDomainEvent('PlayerWasAdded', ({ players }) => {
    saveGameSettings({ players });
    renderPlayersStepper(players);
});

onDomainEvent('PlayerWasRemoved', ({ players }) => {
    saveGameSettings({ players });
    renderPlayersStepper(players);
});

playersStepper.querySelector('.stepper-minus').addEventListener('click', RemovePlayer);
playersStepper.querySelector('.stepper-plus').addEventListener('click', AddPlayer);

function initPlayers() {
    const { settings = {} } = readGame();
    const players = settings.players ?? parseInt(playersStepper.dataset.value, 10);
    saveGameSettings({ players });
    renderPlayersStepper(players);
}

initPlayers();

// --- Difficulty: ChooseDifficulty command -----------------------------

const difficultyGroup = document.getElementById('difficultyGroup');
const DIFFICULTY_VALUES = Array.from(difficultyGroup.querySelectorAll('.choice-btn')).map((btn) => btn.dataset.value);

function ChooseDifficulty(difficulty) {
    if (!DIFFICULTY_VALUES.includes(difficulty)) return;

    dispatchDomainEvent('DifficultyWasChosen', { difficulty });
}

function renderDifficulty(difficulty) {
    difficultyGroup.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.classList.toggle('selected', btn.dataset.value === difficulty);
    });
}

onDomainEvent('DifficultyWasChosen', ({ difficulty }) => {
    saveGameSettings({ difficulty });
    renderDifficulty(difficulty);
});

difficultyGroup.querySelectorAll('.choice-btn').forEach((btn) => {
    btn.addEventListener('click', () => ChooseDifficulty(btn.dataset.value));
});

function initDifficulty() {
    const { settings = {} } = readGame();
    const selectedBtn = difficultyGroup.querySelector('.choice-btn.selected');
    const difficulty = settings.difficulty || (selectedBtn ? selectedBtn.dataset.value : DIFFICULTY_VALUES[0]);
    saveGameSettings({ difficulty });
    renderDifficulty(difficulty);
}

initDifficulty();

// --- Game: StartGame command ---------------------------------------------

const startGameBtn = document.getElementById('startGameBtn');

function StartGame() {
    dispatchDomainEvent('GameWasStarted', { currentChapter: 0 });
}

onDomainEvent('GameWasStarted', ({ currentChapter }) => {
    const game = readGame();
    game.state = GAME_STATE.STARTED;
    game.currentChapter = currentChapter;
    saveGame(game);
    window.location.href = 'chapter/';
});

startGameBtn.addEventListener('click', (event) => {
    event.preventDefault();
    StartGame();
});

function initGameState() {
    const game = readGame();
    if (!game.state) {
        game.state = GAME_STATE.NOT_STARTED;
        saveGame(game);
    }
}

initGameState();
