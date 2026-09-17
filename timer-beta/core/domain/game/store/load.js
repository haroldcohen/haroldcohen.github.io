function fetchGame() {
    const { state, settings = {}, chapters, currentChapter } = readGame();

    return new Game({
        state,
        players: settings.players,
        difficulty: settings.difficulty,
        chapters: chapters?.map((chapter) => new Chapter(
            chapter.num,
            chapter.state,
            chapter.helpItems?.map((helpItem) => (
                helpItem.name === 'supplyCrate'
                    ? new SupplyCrate(helpItem.name, helpItem.content, helpItem.id, helpItem.hasBeenUsed)
                    : new HelpItem(helpItem.name, helpItem.hasBeenUsed)
            )),
            chapter.tributes?.map((tribute) => new Tribute(tribute.name, tribute.parameters)),
            chapter.duration,
            chapter.diceOfFortuneWereRolled,
        )),
        currentChapter,
    });
}
