const Constants = require("../constants");
const InventoryItem = require("./inventoryItem");

class Inventory {
    static BASE_SLOT_COUNT = Constants.BASE_SLOT_COUNT;

    constructor(userId, guildId, inventoryItems) {
        this.userId = userId;
        this.guildId = guildId;
        this.items = inventoryItems;

        if (!this.items) {
            this.items = [];
        }
    }

    getTotalSlots() {
        return Inventory.BASE_SLOT_COUNT;
    }

    getInventoryOccupiedSlots() {
        let total = 0;

        for (const inventoryItem of this.items) {
            const itemWeight = inventoryItem.item.weight;
            const slots =  Math.ceil(inventoryItem.count * this.getSlots(itemWeight));
            total += slots;
        }

        return total;
    }

    getSlots(weight) {
        if (weight === 0) {
            return 0.1;
        }

        return weight;
    }

    tryAddItem(item, count = 1) {
        let rollback = () => {};

        const foundItem = this.items.find(ii => ii.item.name === item.name);
        if (foundItem) {
            foundItem.count += count;
            rollback = () => foundItem.count -= count;
        } else {
            const inventoryItem = new InventoryItem(item, count);
            this.items.push(inventoryItem);
            rollback = () => this.items.pop();
        }

        const occupiedSlotsAfterItemAdd = this.getInventoryOccupiedSlots();
        if (occupiedSlotsAfterItemAdd > this.getTotalSlots()) {
            rollback();
            return false;
        }

        return true;
    }
}

module.exports = Inventory;
