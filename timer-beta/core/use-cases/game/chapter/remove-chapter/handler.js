function RemoveChapter() {
    const game = loadGame();
    game.removeChapter();
    saveGame(game);

    dispatchDomainEvent('ChapterWasRemoved', { chapters: game.chapters });
}
