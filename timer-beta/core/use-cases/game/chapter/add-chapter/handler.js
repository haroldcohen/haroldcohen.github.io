function AddChapter() {
    const game = loadGame();
    game.addChapter();
    saveGame(game);

    dispatchDomainEvent('ChapterWasAdded', { chapters: game.chapters });
}
