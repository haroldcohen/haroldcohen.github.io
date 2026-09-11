class Chapter {
    constructor(num, state = CHAPTER_STATE.NOT_STARTED, helpItems = [], tributes = []) {
        this.num = num;
        this.state = state;
        this.helpItems = helpItems;
        this.tributes = tributes;
    }

    load() {
        this.state = CHAPTER_STATE.LOADED;
    }
}
