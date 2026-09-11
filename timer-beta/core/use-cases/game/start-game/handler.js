function StartGame() {
    const game = loadGame();
    game.start();
    saveGame(game);

    dispatchDomainEvent('GameWasStarted');
}
