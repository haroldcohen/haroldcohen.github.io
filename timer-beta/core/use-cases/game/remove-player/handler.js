function RemovePlayer() {
    const game = fetchGame();
    game.removePlayer();
    saveGame(game);

    dispatchDomainEvent('PlayerWasRemoved', { players: game.settings.players });
}
