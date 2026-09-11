function ChooseDifficulty(difficulty) {
    const game = fetchGame();
    game.chooseDifficulty(difficulty);
    saveGame(game);

    dispatchDomainEvent('DifficultyWasChosen', { difficulty });
}
