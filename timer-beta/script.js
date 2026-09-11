// --- Chapters: AddChapter / RemoveChapter commands -------------------------

const chaptersStepper = document.querySelector('.stepper[data-setting="chapters"]');

function renderChaptersStepper(chapters) {
    chaptersStepper.querySelector('.stepper-value').textContent = chapters.length;
    chaptersStepper.querySelector('.stepper-minus').disabled = chapters.length <= CHAPTERS_MIN;
    chaptersStepper.querySelector('.stepper-plus').disabled = chapters.length >= CHAPTERS_MAX;
}

onDomainEvent('ChapterWasAdded', ({ chapters }) => {
    renderChaptersStepper(chapters);
});

onDomainEvent('ChapterWasRemoved', ({ chapters }) => {
    renderChaptersStepper(chapters);
});

chaptersStepper.querySelector('.stepper-minus').addEventListener('click', RemoveChapter);
chaptersStepper.querySelector('.stepper-plus').addEventListener('click', AddChapter);

// --- Players: AddPlayer / RemovePlayer commands -----------------------------

const playersStepper = document.querySelector('.stepper[data-setting="players"]');

function renderPlayersStepper(players) {
    playersStepper.querySelector('.stepper-value').textContent = players;
    playersStepper.querySelector('.stepper-minus').disabled = players <= PLAYERS_MIN;
    playersStepper.querySelector('.stepper-plus').disabled = players >= PLAYERS_MAX;
}

onDomainEvent('PlayerWasAdded', ({ players }) => {
    renderPlayersStepper(players);
});

onDomainEvent('PlayerWasRemoved', ({ players }) => {
    renderPlayersStepper(players);
});

playersStepper.querySelector('.stepper-minus').addEventListener('click', RemovePlayer);
playersStepper.querySelector('.stepper-plus').addEventListener('click', AddPlayer);

// --- Difficulty: ChooseDifficulty command -----------------------------

const difficultyGroup = document.getElementById('difficultyGroup');

function renderDifficulty(difficulty) {
    difficultyGroup.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.classList.toggle('selected', btn.dataset.value === difficulty);
    });
}

onDomainEvent('DifficultyWasChosen', ({ difficulty }) => {
    renderDifficulty(difficulty);
});

difficultyGroup.querySelectorAll('.choice-btn').forEach((btn) => {
    btn.addEventListener('click', () => ChooseDifficulty(btn.dataset.value));
});

// --- Game: StartGame command ---------------------------------------------

const startGameBtn = document.getElementById('startGameBtn');

onDomainEvent('GameWasStarted', () => {
    window.location.href = 'chapter/';
});

startGameBtn.addEventListener('click', (event) => {
    event.preventDefault();
    StartGame();
});

onDomainEvent('newGameWasCreated', ({ difficulty, players, chapters }) => {
    renderDifficulty(difficulty);
    renderPlayersStepper(players);
    renderChaptersStepper(chapters);
});

CreateNewGame();
