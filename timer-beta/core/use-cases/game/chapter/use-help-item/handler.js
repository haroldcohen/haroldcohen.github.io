function UseHelpItem(itemName) {
    const game = fetchGame();

    try {
        game.useHelpItem(itemName);
    } catch {
        return;
    }

    saveGame(game);
    const chapter = game.chapters[game.currentChapter];
    dispatchDomainEvent('HelpItemHasBeenUsed', { chapterNum: chapter.num, itemName });
}
