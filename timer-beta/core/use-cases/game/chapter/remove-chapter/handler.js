function RemoveChapter() {
    const game = fetchGame();
    game.removeChapter();
    saveGame(game);

    dispatchDomainEvent('ChapterWasRemoved', { chapters: game.chapters });
}
