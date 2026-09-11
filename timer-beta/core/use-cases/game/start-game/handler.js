function StartGame() {
    const game = fetchGame();
    game.start();
    saveGame(game);

    dispatchDomainEvent('GameWasStarted');
}
