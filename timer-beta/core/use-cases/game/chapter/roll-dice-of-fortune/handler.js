function RollDiceOfFortune() {
    const game = fetchGame();
    game.rollDiceOfFortune();
    saveGame(game);

    dispatchDomainEvent('DiceOfFortuneWereRolled');
}
