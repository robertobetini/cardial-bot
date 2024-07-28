class InventoryItem {
    constructor(item, count) {
        this.item = item;
        this.count = count;
    }

    static fromDTO(inventoryItemDTO) {
        if (!inventoryItemDTO) {
            return null;
        }

        return new InventoryItem(
            inventoryItemDTO.ITEMS, 
            inventoryItemDTO.PLAYER_INVENTORY.count
        );
    }

    toString() {
        return `${this.item.name} [${this.count}x]`;
    }
}

module.exports = InventoryItem;
