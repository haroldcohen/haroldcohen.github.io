function DisplayHelpItemDetails(itemName, chapterNum) {
    const game = fetchGame();
    const chapter = game.chapters.find((c) => c.num === chapterNum);
    const remaining = chapter.helpItems.filter((helpItem) => helpItem.name === itemName).length;

    return fetch('../../data/dice-of-fortune/help/display.json')
        .then((res) => res.json())
        .then((helpDisplayData) => {
            const item = helpDisplayData.find((entry) => entry.name === itemName);
            const isCrate = !!item.items;
            const verb = isCrate ? 'Ouvrir' : 'Utiliser';
            const unit = remaining > 1 ? 'restantes' : 'restante';

            return {
                heading: item.label.full,
                badge: 'Aide',
                description: item.description,
                useButtonText: `${verb} (${remaining} ${unit})`,
            };
        });
}
