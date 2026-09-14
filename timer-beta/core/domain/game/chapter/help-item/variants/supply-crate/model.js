class SupplyCrate {
    constructor(name, content) {
        this.name = name;
        this.content = content;
    }

    toDTO() {
        return Object.freeze({ name: this.name, content: this.content });
    }
}
