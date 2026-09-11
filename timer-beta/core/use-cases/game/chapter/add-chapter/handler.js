function AddChapter() {
    const game = fetchGame();
    game.addChapter();
    saveGame(game);

    dispatchDomainEvent('ChapterWasAdded', { chapters: game.chapters });
}
