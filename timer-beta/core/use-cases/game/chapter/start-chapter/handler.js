function StartChapter() {
    const game = fetchGame();

    try {
        game.startChapter();
    } catch {
        return;
    }

    saveGame(game);
    dispatchDomainEvent('ChapterHasStarted');
}
