function DisplayTributeDetails(chapterNum) {
    const game = fetchGame();
    const chapter = game.chapters.find((c) => c.num === chapterNum);
    const [tribute] = chapter.tributes;

    // A tribute's own text can reference one or more rolled parameters (e.g. which
    // zombie value, which player) — resolve each {{paramKey.text}} placeholder by
    // finding the group the rolled value belongs to, then filling that group's {{value}}.
    function resolveParameterText(paramGroups, valueName) {
        for (const group of paramGroups) {
            const match = group.values.find((value) => value.name === valueName);
            if (match) return group.text.replace('{{value}}', match.value);
        }
        return '';
    }

    return fetch('../../data/dice-of-fortune/tribute/display.json')
        .then((res) => res.json())
        .then((tributeDisplayData) => {
            const display = tributeDisplayData.find((entry) => entry.name === tribute.name);
            const description = display.description.map((line) => (
                Object.entries(tribute.parameters).reduce((text, [paramKey, valueName]) => (
                    text.replace(`{{${paramKey}.text}}`, resolveParameterText(display[paramKey], valueName))
                ), line)
            ));

            return {
                heading: display.label.full,
                badge: 'Tribut',
                description,
            };
        });
}
