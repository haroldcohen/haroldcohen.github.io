function LoadChapter() {
    const game = fetchGame();
    const chapter = game.loadChapter();

    saveGame(game);
    dispatchDomainEvent('ChapterWasLoaded', { chapter });
}
