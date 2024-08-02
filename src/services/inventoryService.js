const inventoryDAO = require("../DAOs/inventoryDAO");

const ItemService = require("./itemService");
const UserService = require("./userService");
const StatsService = require("./statsService");
const Constants = require("../constants");

const Logger = require("../logger");

const { shuffle } = require("../utils");

class InventoryService {
    static pollItemRegex = /(.*)\[x(\d+)\]/;

    static distributeLootEvenly(pollItem, userIds, guildId) {
        //pollItem has structure -> {item_name} [x{quantity}]
        const match = InventoryService.pollItemRegex.exec(pollItem);
        if (!match) {
            throw new Error(`Couldn't parse Poll Item ${pollItem}`);
        }

        const itemName = match[1].trim();
        const quantity = Number(match[2].trim());

        Logger.debug(`Searching for item ${pollItem}`);
        const item = ItemService.like(itemName, 1, true)[0];
        if (!item) {
            throw new Error(`Couldn't find item ${itemName}`);
        }
        if (item.id === Constants.GOLD_ITEM_ID) {
            InventoryService.distributeGoldEvenly(quantity, userIds, guildId);
            return null;
        }
        Logger.debug(`Found item ${item.name}, ${item.id}`);

        let distributedQuantity = 0;
        for (let i = 0; i < quantity; i++) {
            const index = i % userIds.length;
            if (index === 0) {
                shuffle(userIds);
            }

            const userId = userIds[index];
            const userInventory = inventoryDAO.getFullInventory(userId, guildId);
            const isItemAddedSuccessfully = userInventory.tryAddItem(item);
            if (!isItemAddedSuccessfully) {
                continue;
            }

            InventoryService.upsertFullInventory(userInventory);
            distributedQuantity++;
        }

        return distributedQuantity === quantity ? null : `${itemName} [x${quantity-distributedQuantity}]`;
    }

    static distributeGoldEvenly(quantity, userIds, guildId) {
        const evenGoldQuantity = Math.floor(quantity / userIds.length);

        let remainingQuantity = quantity;
        for (let i = 0; i < userIds.length; i++) {
            const userId = userIds[i];
            const user = UserService.get(guildId, userId, true);
            if (!user) {
                throw new Error(`Couldn't find user ${userId} from guild ${guildId}`);
            }

            const newGold = i >= userIds.length - 1 
                ? user.stats.gold + remainingQuantity
                : user.stats.gold + evenGoldQuantity;
            
            remainingQuantity -= evenGoldQuantity;
            StatsService.updateSingleStat(userId, guildId, "gold", newGold);
        }
    }

    static async createBackup() {
        return await inventoryDAO.createBackup();
    }

    static async applyBackup(bkpName, itemIds) {
        inventoryDAO.applyBackup(bkpName, itemIds);
    }

    static getFullInventory(userId, guildId) {
        return inventoryDAO.getFullInventory(userId, guildId);
    }

    static update(userId, guildId, inventoryItem) {
        inventoryItem.count > 0
            ? inventoryDAO.update(userId, guildId, inventoryItem.item.id, inventoryItem.count) 
            : inventoryDAO.deleteOne(userId, guildId, inventoryItem.item.id);
    }

    static upsertFullInventory(inventory) {
        inventoryDAO.upsertFullInventory(inventory);
    }

    static clear(userId, guildId) {
        inventoryDAO.clear(userId, guildId);
    }

    static deleteAll() {
        inventoryDAO.deleteAll();
    }
}

module.exports = InventoryService;
