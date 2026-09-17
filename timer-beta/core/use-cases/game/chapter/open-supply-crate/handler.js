function OpenSupplyCrate(id) {
    const game = fetchGame();
    let chapter;

    try {
        chapter = game.openSupplyCrate(id);
    } catch {
        return;
    }

    saveGame(game);

    const crate = chapter.helpItems.find((item) => item.name === 'supplyCrate' && item.id === id);

    fetch('../../data/dice-of-fortune/help/display.json')
        .then((res) => res.json())
        .then((helpDisplayData) => {
            const display = helpDisplayData.find((entry) => entry.name === 'supplyCrate');
            const contentDisplay = display.items.find((item) => item.name === crate.content.name).contentDisplay;
            const description = crate.content.ammo
                ? contentDisplay.map((line) => line.replace('{{ammo.qt}}', crate.content.ammo))
                : contentDisplay;

            dispatchDomainEvent('SupplyCrateHasBeenOpen', { chapterNum: chapter.num, description });
        });
}
