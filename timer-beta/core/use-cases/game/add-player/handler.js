function AddPlayer() {
    const game = fetchGame();
    game.addPlayer();
    saveGame(game);

    dispatchDomainEvent('PlayerWasAdded', { players: game.settings.players });
}
