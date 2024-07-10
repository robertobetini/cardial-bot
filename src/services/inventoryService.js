const inventoryDAO = require("../DAOs/inventoryDAO");

const ItemService = require("./itemService");
const UserService = require("./userService");
const StatsService = require("./statsService");
const Constants = require("../constants");

const Logger = require("../logger");

const { shuffle } = require("../utils");

class InventoryService {
    static pollItemRegex = /(.*)\[x(\d+)\]/;

    static getFullInventory(userId, guildId) {
        return inventoryDAO.getFullInventory(userId, guildId);
    }

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
            return;
        }
        Logger.debug(`Found item ${item.name}, ${item.id}`);

        for (let i = 0; i < quantity; i++) {
            const index = i % userIds.length;
            if (index === 0) {
                shuffle(userIds);
            }

            const userId = userIds[index];
            
            const inventoryItem = inventoryDAO.get(userId, guildId, item.id);
            if (inventoryItem) {
                inventoryDAO.update(userId, guildId, item.id, ++inventoryItem.count);
                continue;
            }

            inventoryDAO.insert(userId, guildId, item.id, 1);
        }
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

    static getInventoryOccupiedSlots(inventory) {
        let total = 0;

        for (const inventoryItem of inventory) {
            console.log(inventoryItem);
            const itemWeight = inventoryItem.item.weight;
            const slots =  Math.ceil(inventoryItem.count * InventoryService.getSlots(itemWeight));
            total += slots;
        }

        return total;
    }

    static getSlots(weight) {
        if (weight === 0) {
            return 0.1;
        }

        return weight;
    }
}

module.exports = InventoryService;
