class HelpItem {
    constructor(name) {
        this.name = name;
    }

    toDTO() {
        return Object.freeze({ name: this.name });
    }
}
