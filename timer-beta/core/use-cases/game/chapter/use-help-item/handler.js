function UseHelpItem(itemName) {
    const game = fetchGame();
    let chapter;

    try {
        chapter = game.useHelpItem(itemName);
    } catch {
        return;
    }

    saveGame(game);
    dispatchDomainEvent('HelpItemHasBeenUsed', { chapterNum: chapter.num, itemName });
}
