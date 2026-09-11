function RemovePlayer() {
    const game = loadGame();
    game.removePlayer();
    saveGame(game);

    dispatchDomainEvent('PlayerWasRemoved', { players: game.settings.players });
}
