class SupplyCrate {
    constructor(name, content, id, hasBeenUsed = false) {
        this.name = name;
        this.content = content;
        this.id = id;
        this.hasBeenUsed = hasBeenUsed;
    }

    use() {
        this.hasBeenUsed = true;
    }

    toDTO() {
        return Object.freeze({ name: this.name, content: this.content, id: this.id, hasBeenUsed: this.hasBeenUsed });
    }
}
