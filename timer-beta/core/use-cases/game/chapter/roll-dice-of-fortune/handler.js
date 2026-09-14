function RollDiceOfFortune() {
    const game = fetchGame();
    game.rollDiceOfFortune();
    saveGame(game);

    const chapter = game.chapters[game.currentChapter];
    dispatchDomainEvent('DiceOfFortuneWereRolled', { chapterNum: chapter.num });
}
