function fetchGame() {
    const { state, settings = {}, chapters, currentChapter } = readGame();

    return new Game({
        state,
        players: settings.players,
        difficulty: settings.difficulty,
        chapters: chapters?.map((chapter) => new Chapter(chapter.num, chapter.state)),
        currentChapter,
    });
}
