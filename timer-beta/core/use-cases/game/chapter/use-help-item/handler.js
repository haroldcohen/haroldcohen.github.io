function UseHelpItem(itemName) {
    const game = fetchGame();

    try {
        game.useHelpItem(itemName);
    } catch {
        return;
    }

    saveGame(game);

    const gameDTO = game.toDTO();
    const chapter = gameDTO.chapters[gameDTO.currentChapter];
    dispatchDomainEvent('HelpItemHasBeenUsed', { chapterNum: chapter.num, itemName });
}
