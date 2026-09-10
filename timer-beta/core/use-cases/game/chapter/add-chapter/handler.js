function AddChapter() {
    const { chapters = [] } = readGame();
    if (chapters.length >= CHAPTERS_MAX) return;

    dispatchDomainEvent('ChapterWasAdded', {
        chapter: { num: chapters.length + 1, state: CHAPTER_STATE.NOT_STARTED },
    });
}
