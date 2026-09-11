function LoadChapter() {
    const game = fetchGame();
    game.loadChapter();

    dispatchDomainEvent('ChapterWasLoaded', { chapter: game.chapters[game.currentChapter] });
}
