class Chapter {
    // Supply crate is deliberately left out for now — it has its own ticket (DEA-6 story).
    static HELP_ITEM_ROLL_CHANCES = {
        campfire: 'HIGH',
        scout: 'MEDIUM',
        improvisedBarricade: 'MEDIUM',
        sparePart: 'LOW',
    };

    static ROLL_CHANCE_WEIGHTS = { VERY_HIGH: 90, HIGH: 60, MEDIUM: 30, LOW: 10 };

    static HELP_ITEM_CAPS = {
        campfire: 1,
        scout: 1,
        improvisedBarricade: 1,
        sparePart: 1,
    };

    constructor(num, state = CHAPTER_STATE.NOT_STARTED, helpItems = [], tributes = []) {
        this.num = num;
        this.state = state;
        this.helpItems = helpItems;
        this.tributes = tributes;
    }

    load() {
        this.state = CHAPTER_STATE.LOADED;
    }

    rollDiceOfFortune() {
        const itemCount = 1 + Math.floor(Math.random() * 3);
        const grantedCounts = new Map();
        for (const helpItem of this.helpItems) {
            grantedCounts.set(helpItem.name, (grantedCounts.get(helpItem.name) || 0) + 1);
        }

        for (let i = 0; i < itemCount; i++) {
            const eligibleNames = Object.keys(Chapter.HELP_ITEM_ROLL_CHANCES).filter(
                (name) => (grantedCounts.get(name) || 0) < Chapter.HELP_ITEM_CAPS[name]
            );
            if (eligibleNames.length === 0) break;

            const name = Chapter.#pickHelpItemName(eligibleNames);
            grantedCounts.set(name, (grantedCounts.get(name) || 0) + 1);
            this.helpItems.push(new HelpItem(name));
        }
    }

    static #pickHelpItemName(names) {
        const total = names.reduce((sum, name) => sum + Chapter.ROLL_CHANCE_WEIGHTS[Chapter.HELP_ITEM_ROLL_CHANCES[name]], 0);
        let roll = Math.random() * total;
        for (const name of names) {
            roll -= Chapter.ROLL_CHANCE_WEIGHTS[Chapter.HELP_ITEM_ROLL_CHANCES[name]];
            if (roll <= 0) return name;
        }
        return names[names.length - 1];
    }
}
