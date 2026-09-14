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

    static TRIBUTE_ROLL_CHANCES = {
        ironSkin: 'HIGH',
        explosiveBlood: 'HIGH',
        bloodScent: 'HIGH',
        radioSilence: 'MEDIUM',
        slipperyGround: 'LOW',
        rationing: 'MEDIUM',
        corruptedSupplies: 'MEDIUM',
    };

    // Each parameter is a list of groups (see DEA-8's group rules). A group only needs its own
    // rollChances when there's more than one group for that parameter — otherwise it's picked
    // straight away and only its values are weighted against each other.
    static TRIBUTE_PARAMETER_ROLL_CHANCES = {
        ironSkin: {
            affectedZombies: [
                {
                    group: 'zombies',
                    values: { val01: 'HIGH', val03: 'HIGH', val05: 'MEDIUM', val08: 'MEDIUM', val13: 'LOW' },
                },
            ],
        },
        explosiveBlood: {
            affectedZombies: [
                {
                    group: 'zombies',
                    values: { val01: 'LOW', val03: 'LOW', val05: 'MEDIUM', val08: 'HIGH', val13: 'HIGH' },
                },
            ],
        },
        bloodScent: {
            affectedZombies: [
                {
                    group: 'zombies',
                    rollChances: 'HIGH',
                    values: { val01: 'LOW', val03: 'LOW', val05: 'HIGH', val08: 'MEDIUM', val13: 'LOW' },
                },
                {
                    group: 'specialZombies',
                    rollChances: 'MEDIUM',
                    values: { hiddenZombie: 'MEDIUM' },
                },
                {
                    group: 'bossZombies',
                    rollChances: 'MEDIUM',
                    values: { zombieBoss: 'MEDIUM' },
                },
            ],
            affectedPlayers: [
                {
                    group: 'playersCardsCount',
                    rollChances: 'HIGH',
                    values: { weakestPlayer: 'MEDIUM', strongestPlayer: 'HIGH' },
                },
                {
                    group: 'playersPosition',
                    rollChances: 'MEDIUM',
                    values: { leader: 'LOW', lastPlayer: 'HIGH' },
                },
            ],
        },
        rationing: {
            affectedPlayers: [
                {
                    group: 'playersPosition',
                    values: { leader: 'LOW', lastPlayer: 'HIGH' },
                },
            ],
        },
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

            const name = Chapter.#pickWeightedName(eligibleNames, Chapter.HELP_ITEM_ROLL_CHANCES);
            grantedCounts.set(name, (grantedCounts.get(name) || 0) + 1);
            this.helpItems.push(new HelpItem(name));
        }

        const tributeNames = Object.keys(Chapter.TRIBUTE_ROLL_CHANCES);
        new CorruptedSuppliesTributeFilter(this.toDTO()).filter(tributeNames);
        console.log(tributeNames); // TEMP: check filtered tribute names

        const tributeName = Chapter.#pickWeightedName(tributeNames, Chapter.TRIBUTE_ROLL_CHANCES);
        const tribute = new Tribute(tributeName);
        const parameterGroupsByName = Chapter.TRIBUTE_PARAMETER_ROLL_CHANCES[tributeName];
        if (parameterGroupsByName) {
            for (const [parameterName, groups] of Object.entries(parameterGroupsByName)) {
                tribute.parameters[parameterName] = Chapter.#pickTributeParameterValue(groups);
            }
        }
        this.tributes.push(tribute);
    }

    static #pickWeightedName(names, rollChances) {
        const total = names.reduce((sum, name) => sum + Chapter.ROLL_CHANCE_WEIGHTS[rollChances[name]], 0);
        let roll = Math.random() * total;
        for (const name of names) {
            roll -= Chapter.ROLL_CHANCE_WEIGHTS[rollChances[name]];
            if (roll <= 0) return name;
        }
        return names[names.length - 1];
    }

    static #pickTributeParameterValue(groups) {
        let group = groups[0];
        if (groups.length > 1) {
            const groupRollChances = Object.fromEntries(groups.map((g) => [g.group, g.rollChances]));
            const groupName = Chapter.#pickWeightedName(Object.keys(groupRollChances), groupRollChances);
            group = groups.find((g) => g.group === groupName);
        }
        return Chapter.#pickWeightedName(Object.keys(group.values), group.values);
    }

    toDTO() {
        return Object.freeze({
            num: this.num,
            state: this.state,
            helpItems: this.helpItems.map((helpItem) => helpItem.toDTO()),
            tributes: this.tributes,
        });
    }
}
