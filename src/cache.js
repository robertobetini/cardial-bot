class Cache {
    items = {};

    constructor(lifetime = 600_000) {
        this.lifetime = lifetime;
    }

    get(key) {
        return this.items[key]?.item;
    }

    set(key, item, callback = (item) => { return; }, lifetime = null) {
        const existingItem = this.items[key];
        if (existingItem) {
            existingItem.item = item;
            existingItem.timer?.refresh();
            return existingItem.item;
        }

        const onDelete = () => {
            callback(existingItem);
            delete this.items[key];
        };

        this.items[key] = {
            item,
            timer: setTimeout(onDelete, lifetime ?? this.lifetime)
        };

        return this.items[key].item;
    }

    unset(key) {
        const item = this.get(key);
        if (!item) {
            return;
        }

        item.timer?.unref();
        delete this.items[key];
    }
}

module.exports = Cache;
