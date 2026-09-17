function RollDiceOfFortune() {
    const game = fetchGame();

    try {
        game.rollDiceOfFortune();
    } catch {
        return;
    }

    saveGame(game);

    const gameDTO = game.toDTO();
    const chapter = gameDTO.chapters[gameDTO.currentChapter];
    dispatchDomainEvent('DiceOfFortuneWereRolled', { chapterNum: chapter.num });
}
