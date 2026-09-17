function LoadChapter() {
    const game = fetchGame();
    game.loadChapter();

    saveGame(game);

    const gameDTO = game.toDTO();
    const chapter = gameDTO.chapters[gameDTO.currentChapter];
    dispatchDomainEvent('ChapterWasLoaded', { chapter });
}
