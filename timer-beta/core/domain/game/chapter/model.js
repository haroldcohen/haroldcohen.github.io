class Chapter {
    constructor(num, state = CHAPTER_STATE.NOT_STARTED) {
        this.num = num;
        this.state = state;
    }

    load() {
        this.state = CHAPTER_STATE.LOADED;
    }
}
