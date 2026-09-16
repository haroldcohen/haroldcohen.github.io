class HelpItem {
    constructor(name, hasBeenUsed = false) {
        this.name = name;
        this.hasBeenUsed = hasBeenUsed;
    }

    use() {
        this.hasBeenUsed = true;
    }

    toDTO() {
        return Object.freeze({ name: this.name, hasBeenUsed: this.hasBeenUsed });
    }
}
