function ChooseDifficulty(difficulty) {
    const game = loadGame();
    game.chooseDifficulty(difficulty);
    saveGame(game);

    dispatchDomainEvent('DifficultyWasChosen', { difficulty });
}
