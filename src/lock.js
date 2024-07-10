class Lock {
    constructor() {
        this.locked = false;
    }

    lock = () => this.locked = true;
    unlock = () => this.locked = false;
}

module.exports = Lock;
