function AddPlayer() {
    const game = loadGame();
    game.addPlayer();
    saveGame(game);

    dispatchDomainEvent('PlayerWasAdded', { players: game.settings.players });
}
