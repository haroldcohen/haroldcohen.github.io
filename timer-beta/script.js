const GAME_STORAGE_KEY = 'deadEndGame';

function readGame() {
    try {
        return JSON.parse(sessionStorage.getItem(GAME_STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

function saveGameSettings() {
    const game = readGame();
    game.settings = {};

    document.querySelectorAll('.stepper').forEach((stepper) => {
        game.settings[stepper.dataset.setting] = parseInt(stepper.dataset.value, 10);
    });

    const selectedDifficulty = document.querySelector('#difficultyGroup .choice-btn.selected');
    game.settings.difficulty = selectedDifficulty ? selectedDifficulty.dataset.value : 'normal';

    sessionStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(game));
}

document.querySelectorAll('.stepper').forEach((stepper) => {
    const min = parseInt(stepper.dataset.min, 10);
    const max = parseInt(stepper.dataset.max, 10);
    const valueEl = stepper.querySelector('.stepper-value');
    const minusBtn = stepper.querySelector('.stepper-minus');
    const plusBtn = stepper.querySelector('.stepper-plus');

    const render = () => {
        const value = parseInt(stepper.dataset.value, 10);
        valueEl.textContent = value;
        minusBtn.disabled = value <= min;
        plusBtn.disabled = value >= max;
    };

    minusBtn.addEventListener('click', () => {
        const value = Math.max(min, parseInt(stepper.dataset.value, 10) - 1);
        stepper.dataset.value = value;
        render();
        saveGameSettings();
    });

    plusBtn.addEventListener('click', () => {
        const value = Math.min(max, parseInt(stepper.dataset.value, 10) + 1);
        stepper.dataset.value = value;
        render();
        saveGameSettings();
    });

    render();
});

document.querySelectorAll('.choice-group').forEach((group) => {
    group.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            group.querySelectorAll('.choice-btn').forEach((b) => b.classList.remove('selected'));
            btn.classList.add('selected');
            saveGameSettings();
        });
    });
});

saveGameSettings();
