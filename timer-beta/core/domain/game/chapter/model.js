class Chapter {
    static DIFFICULTY_MINUTES = {
        facile: 20,
        normal: 15,
        difficile: 10,
    };

    static HELP_ITEM_ROLL_CHANCES = {
        campfire: 'HIGH',
        scout: 'MEDIUM',
        improvisedBarricade: 'MEDIUM',
        sparePart: 'LOW',
        supplyCrate: 'HIGH',
    };

    static ROLL_CHANCE_WEIGHTS = { VERY_HIGH: 90, HIGH: 60, MEDIUM: 30, LOW: 10 };

    static HELP_ITEM_CAPS = {
        campfire: 1,
        scout: 1,
        improvisedBarricade: 1,
        sparePart: 1,
        supplyCrate: 2,
    };

    static SUPPLY_CRATE_CONTENT_ROLL_CHANCES = {
        shotgun: 'HIGH',
        ak47: 'HIGH',
        armor: 'MEDIUM',
        machete: 'MEDIUM',
        cure: 'LOW',
    };

    static SUPPLY_CRATE_CONTENT_AMMO_ROLL_CHANCES = {
        shotgun: { 1: 'HIGH', 3: 'HIGH', 5: 'MEDIUM', 8: 'MEDIUM' },
        ak47: { 5: 'HIGH', 8: 'HIGH', 13: 'MEDIUM' },
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

    constructor(num, state = CHAPTER_STATE.NOT_STARTED, helpItems = [], tributes = [], duration = null, diceOfFortuneWereRolled = false) {
        this.num = num;
        this.state = state;
        this.helpItems = helpItems;
        this.tributes = tributes;
        this.duration = duration;
        this.diceOfFortuneWereRolled = diceOfFortuneWereRolled;
    }

    load(difficulty) {
        this.state = CHAPTER_STATE.LOADED;
        this.#computeAndSetTimerDuration(difficulty);
    }

    #computeAndSetTimerDuration(difficulty) {
        this.duration = Chapter.DIFFICULTY_MINUTES[difficulty] * 60 * 100;
    }

    rollDiceOfFortune() {
        if (this.diceOfFortuneWereRolled) {
            throw new Error('The dice of fortune have already been rolled for this chapter.');
        }

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

            if (name === 'supplyCrate') {
                const contentName = Chapter.#pickWeightedName(
                    Object.keys(Chapter.SUPPLY_CRATE_CONTENT_ROLL_CHANCES),
                    Chapter.SUPPLY_CRATE_CONTENT_ROLL_CHANCES
                );
                const content = { name: contentName };
                const ammoRollChances = Chapter.SUPPLY_CRATE_CONTENT_AMMO_ROLL_CHANCES[contentName];
                if (ammoRollChances) {
                    content.ammo = Number(Chapter.#pickWeightedName(Object.keys(ammoRollChances), ammoRollChances));
                }
                const id = grantedCounts.get(name) - 1;
                this.helpItems.push(new SupplyCrate(name, content, id));
            } else {
                this.helpItems.push(new HelpItem(name));
            }
        }

        const tributeNames = Object.keys(Chapter.TRIBUTE_ROLL_CHANCES);
        new CorruptedSuppliesTributeFilter(this.toDTO()).filter(tributeNames);

        const tributeName = Chapter.#pickWeightedName(tributeNames, Chapter.TRIBUTE_ROLL_CHANCES);
        const tribute = new Tribute(tributeName);
        const parameterGroupsByName = Chapter.TRIBUTE_PARAMETER_ROLL_CHANCES[tributeName];
        if (parameterGroupsByName) {
            for (const [parameterName, groups] of Object.entries(parameterGroupsByName)) {
                tribute.parameters[parameterName] = Chapter.#pickTributeParameterValue(groups);
            }
        }
        this.tributes.push(tribute);
        this.diceOfFortuneWereRolled = true;
    }

    start() {
        if (!this.diceOfFortuneWereRolled) {
            throw new Error('The chapter can only be started once the dice of fortune have been rolled.');
        }

        this.state = CHAPTER_STATE.RUNNING;
    }

    useHelpItem(itemName) {
        if (this.state !== CHAPTER_STATE.RUNNING && this.state !== CHAPTER_STATE.PAUSED) {
            throw new Error('Help items can only be used while the chapter is running or paused.');
        }

        const helpItem = this.helpItems.find((item) => item.name === itemName);
        helpItem.use();
    }

    openSupplyCrate(id) {
        if (this.state !== CHAPTER_STATE.RUNNING && this.state !== CHAPTER_STATE.PAUSED) {
            throw new Error('A supply crate can only be opened while the chapter is running or paused.');
        }

        const crate = this.helpItems.find((item) => item.name === 'supplyCrate' && item.id === id);
        crate.use();
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
            duration: this.duration,
            diceOfFortuneWereRolled: this.diceOfFortuneWereRolled,
        });
    }
}
