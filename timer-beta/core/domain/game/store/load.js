function fetchGame() {
    const { state, settings = {}, chapters, currentChapter } = readGame();

    return new Game({
        state,
        players: settings.players,
        difficulty: settings.difficulty,
        chapters: chapters?.map((chapter) => new Chapter(
            chapter.num,
            chapter.state,
            chapter.helpItems?.map((helpItem) => new HelpItem(helpItem.name)),
            chapter.tributes?.map((tribute) => new Tribute(tribute.name, tribute.parameters)),
        )),
        currentChapter,
    });
}
