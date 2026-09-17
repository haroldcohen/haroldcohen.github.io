function RollDiceOfFortune() {
    const game = fetchGame();
    let chapter;

    try {
        chapter = game.rollDiceOfFortune();
    } catch {
        return;
    }

    saveGame(game);
    dispatchDomainEvent('DiceOfFortuneWereRolled', { chapterNum: chapter.num });
}
