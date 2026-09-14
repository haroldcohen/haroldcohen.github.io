class CorruptedSuppliesTributeFilter {
    static MIN_OBTAINED_SUPPLY_CRATE_COUNT = 2;

    constructor(chapter) {
        this.chapter = chapter;
    }

    filter(tributes) {
        const obtainedSupplyCrateCount = this.chapter.helpItems.filter((helpItem) => helpItem.name === 'supplyCrate').length;
        if (obtainedSupplyCrateCount >= CorruptedSuppliesTributeFilter.MIN_OBTAINED_SUPPLY_CRATE_COUNT) return;

        const index = tributes.indexOf('corruptedSupplies');
        if (index !== -1) tributes.splice(index, 1);
    }
}
