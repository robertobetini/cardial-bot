const Logger = require("./logger");

class Cache {
    static caches = [];

    name = "NO_NAME";
    items = {};

    constructor(name, lifetime = 600_000) {
        this.name = name;
        this.lifetime = lifetime;
        Cache.caches.push(this);
    }

    static cacheSummary() {
        return Cache.caches
            .map(cache => `${cache.name} (LT: ${cache.lifetime / 1000}s): ${Object.keys(cache.items).length} entries`)
            .join("\n");
    }

    get(key) {
        return this.items[key]?.item;
    }

    set(key, item, callback = async (item) => { return; }, lifetime = null) {
        const existingItem = this.items[key];
        if (existingItem) {
            existingItem.item = item;
            existingItem.timer?.refresh();
            return existingItem.item;
        }

        const onDelete = async () => {
            const existingItem = this.items[key];
            await callback(existingItem?.item);
            delete this.items[key];
            Logger.debug(`Expired item ${item} with key ${key} from cache ${this.name}`);
        };

        this.items[key] = {
            item,
            timer: setTimeout(onDelete, lifetime ?? this.lifetime)
        };

        return this.items[key].item;
    }

    unset(key) {
        const item = this.items[key];
        if (!item) {
            return;
        }

        clearTimeout(item.timer);
        delete this.items[key];
    }
}

module.exports = Cache;
