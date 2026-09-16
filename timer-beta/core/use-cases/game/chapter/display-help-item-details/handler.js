function DisplayHelpItemDetails(itemName, chapterNum) {
    const game = fetchGame();
    const chapter = game.chapters.find((c) => c.num === chapterNum);
    const remaining = chapter.helpItems.filter((helpItem) => helpItem.name === itemName && !helpItem.hasBeenUsed).length;

    return fetch('../../data/dice-of-fortune/help/display.json')
        .then((res) => res.json())
        .then((helpDisplayData) => {
            const item = helpDisplayData.find((entry) => entry.name === itemName);
            const isCrate = !!item.items;
            const unit = remaining > 1 ? 'restantes' : 'restante';
            const useButtonText = isCrate ? `Ouvrir (${remaining} ${unit})` : 'Utiliser';

            return {
                heading: item.label.full,
                badge: 'Aide',
                description: item.description,
                useButtonText,
                isCrate,
            };
        });
}
