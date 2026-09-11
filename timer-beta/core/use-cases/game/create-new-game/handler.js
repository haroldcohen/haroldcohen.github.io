function CreateNewGame() {
    const chapters = Array.from({ length: CHAPTERS_DEFAULT }, (_, i) => new Chapter(i + 1));
    const game = new Game({ chapters });
    saveGame(game);

    dispatchDomainEvent('newGameWasCreated', {
        difficulty: game.settings.difficulty,
        players: game.settings.players,
        chapters: game.chapters,
    });
}
