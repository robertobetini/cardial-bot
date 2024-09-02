const https = require("https");

const ItemService = require("./itemService");
const DropsService = require("./dropsService");
const InventoryService = require("./inventoryService");

const Item = require("../models/item");

const Logger = require("../logger");
const { SilentError } = require("../errors/silentError");
const { isValidUrl, unitOfWork } = require("../utils");

const NOT_APPLICABLE_TOKEN = "-";
const SHEETS = ["Armas", "Escudos", "Armaduras", "Acessórios","Itens Únicos", "Consumíveis", "Outros"];
const FETCH_SHEET_URL_TEMPLATE = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEET_ID_ITEMS}/values/{SHEET_NAME}?key=${process.env.GOOGLE_API_KEY}`;

class ItemSyncService {
    static async sync() {
        const bkpName = await InventoryService.createBackup();
        Logger.info(`Created backup: ${bkpName}`);
        
        const itemIds = await unitOfWork(ItemSyncService.execute);

        Logger.info("Applying backup for player inventory");
        await InventoryService.applyBackup(bkpName, itemIds);
    }

    static async execute() {
        Logger.info("Clearing items");
        InventoryService.deleteAll();
        DropsService.deleteAll();
        ItemService.deleteAll();

        const goldItem = new Item("gold", "GOLD", null, NOT_APPLICABLE_TOKEN, NOT_APPLICABLE_TOKEN, 1, NOT_APPLICABLE_TOKEN, null, null, "💰", "{}");
        Logger.info("Inserting default GOLD item");
        ItemService.batchUpsert([goldItem]);

        Logger.info("Fetching and updating items");
        let itemIds = [];
        const promises = [];
        for (const sheet of SHEETS) {
            const url = FETCH_SHEET_URL_TEMPLATE.replace("{SHEET_NAME}", sheet);
            
            const promise = new Promise((resolve, reject) => 
                https.get(url, (res) => {
                    if (res.statusCode >= 400) {
                        reject(new SilentError(`Failed to fetch google sheets with status ${res.statusCode}`));
                    }
    
                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk) => rawData += chunk);
                    res.on('end', () => {
                        try {
                            const data = JSON.parse(rawData);
                            const items = ItemSyncService.parseItems(sheet, data);
                            ItemService.batchInsert(items);
                            itemIds = itemIds.concat(items.map(item => `'${item.id}'`));
                            resolve();
                        } catch (err) {
                            Logger.error(err);
                            reject(err);
                        }
                    });
                }).on("error", (err) => { 
                    Logger.error(err);
                    reject(err);
                })
            );

            promises.push(promise);
        }

        await Promise.all(promises);

        return itemIds;
    }

    static parseItems(sheet, data) {
        switch(sheet) {
            case "Armas":
                return ItemSyncService.parseWeapons(data);
            case "Escudos":
                return ItemSyncService.parseShields(data);
            case "Armaduras":
                return ItemSyncService.parseArmors(data);
            case "Acessórios":
                return ItemSyncService.parseAcessories(data);
            case "Itens Únicos":
                return ItemSyncService.parseUniqueItems(data);
            case "Consumíveis":
                return ItemSyncService.parseUsables(data);
            case "Outros":
                return ItemSyncService.parseOthers(data);
        }
    }

    static parseWeapons(data) {
        const skip = 3;
        const items = [];
        for (let i = skip; i < data.values.length; i++) {
            const values = data.values[i];
            const id = values[0];
            const itemId = `weapon-${id}`;

            if (!values[0]) {
                continue;
            }

            const name = values[1].trim();
            const level = values[5].trim();
            const description = values[2].trim();
            const price = ItemSyncService.parsePrice(values[3]);
            const weight = Number(values[4].trim());
            const imgUrl = ItemSyncService.getUrl(values[13]);
            const emoji = values[14].trim();

            const damage = values[6].toLowerCase().trim();
            const damageType = values[7].trim();
            const weaponType = values[8].split(",").map(v => v.trim());
            const properties = values[9].split(",").map(v => v.trim());
            const metal = values[10].trim();
            const effects = values[11].trim();
            const strRequirement = values[12]?.trim() || NOT_APPLICABLE_TOKEN;

            const details = { damage, damageType, weaponType, properties, metal, effects, strRequirement };

            const item = new Item(itemId, name, level, "weapon", description, price, NOT_APPLICABLE_TOKEN, weight, imgUrl, emoji, JSON.stringify(details));
            items.push(item);
        }
        
        return items;
    }

    static parseShields(data) {
        const skip = 3;
        const items = [];
        for (let i = skip; i < data.values.length; i++) {
            const values = data.values[i];
            const id = values[0];
            const itemId = `shield-${id}`;

            if (!values[0]) {
                continue;
            }

            const name = values[1].trim();
            const level = values[6].trim();
            const description = values[2].trim();
            const price = ItemSyncService.parsePrice(values[3]);
            const weight = Number(values[5].trim());
            const imgUrl = ItemSyncService.getUrl(values[12]);
            const emoji = values[13].trim();

            const CA = Number(values[4]);
            const grip = values[7].trim();
            const properties = values[8].split(",").map(v => v.trim());
            const metal = values[9].trim();
            const damage = values[11].trim();
            const effects = values[10]?.split(",")?.map(v => v.trim());

            const details = { CA, grip, properties, metal, damage, effects };

            const item = new Item(itemId, name, level, "shield", description, price, NOT_APPLICABLE_TOKEN, weight, imgUrl, emoji, JSON.stringify(details));
            items.push(item);
        }
        
        return items;
    }

    static parseArmors(data) {
        const skip = 3;
        const items = [];
        for (let i = skip; i < data.values.length; i++) {
            const values = data.values[i];
            const id = values[0];
            const itemId = `armor-${id}`;

            if (!values[0]) {
                continue;
            }

            const name = values[1].trim();
            const level = values[5].trim();
            const description = values[2].trim();
            const price = ItemSyncService.parsePrice(values[3]);
            const weight = Number(values[4].trim());
            const imgUrl = ItemSyncService.getUrl(values[13]);
            const emoji = values[14]?.trim();

            const metal = values[6].trim();
            const CA = Number(values[7]);
            const stealth = values[8].trim();
            const STR = Number(values[9].trim()) || 1;
            const dexDebuff = values[10].trim();
            const properties = values[11]?.split(",")?.map(v => v.trim());
            const effects = values[12]?.split("\n")?.map(v => v.trim());

            const details = { CA, metal, STR, stealth, dexDebuff, properties, effects };

            const item = new Item(itemId, name, level, "armor", description, price, NOT_APPLICABLE_TOKEN, weight, imgUrl, emoji, JSON.stringify(details));
            items.push(item);
        }
        
        return items;
    }

    static parseAcessories(data) {
        const skip = 3;
        const items = [];
        for (let i = skip; i < data.values.length; i++) {
            const values = data.values[i];
            const id = values[0];
            const itemId = `acessory-${id}`;

            if (!values[0]) {
                continue;
            }

            const name = values[1].trim();
            const level = values[5].trim();
            const tier = values[2].trim();
            const description = values[3].trim();
            const price = ItemSyncService.parsePrice(values[4]);
            const weight = Number(values[7].trim());
            const imgUrl = ItemSyncService.getUrl(values[19]);
            const emoji = values[20].trim();

            const acessoryType = values[7].trim();
            const damage = Number(values[8].trim()) || 0;
            const slots = Number(values[9].trim()) || 0;
            const CA = Number(values[10].trim()) || 0;
            const DEX = Number(values[11].trim()) || 0;
            const WIS = Number(values[12].trim()) || 0;
            const STR = Number(values[13].trim()) || 0;
            const CHA = Number(values[14].trim()) || 0;
            const CON = Number(values[15].trim()) || 0;
            const effects = values[16].trim();
            const disvantage = values[17].trim();
            const properties = values[18]?.split(",")?.map(v => v.trim());

            const details = { acessoryType, damage, slots, CA, DEX, WIS, STR, CHA, CON, effects, disvantage, properties };

            const item = new Item(itemId, name, level, "acessory", description, price, tier, weight, imgUrl, emoji, JSON.stringify(details));
            items.push(item);
        }
        
        return items;
    }

    static parseUsables(data) {
        const skip = 3;
        const items = [];
        for (let i = skip; i < data.values.length; i++) {
            const values = data.values[i];
            const id = values[0];
            const itemId = `usable-${id}`;

            if (!values[0]) {
                continue;
            }
            if (values[0] === "REFEIÇÕES") {
                break;
            }

            const name = values[1].trim();
            const level = values[3].trim();
            const tier = values[2].trim();
            const description = values[4].trim();
            const weight = Number(values[5].trim());
            const price = ItemSyncService.parsePrice(values[6]);
            const imgUrl = ItemSyncService.getUrl(values[11]);
            const emoji = values[12].trim();

            const effects = [ values[7], values[8], values[9], values[10] ];

            const details = { effects: effects.filter(e => e) };

            const item = new Item(itemId, name, level, "usable", description, price, tier, weight, imgUrl, emoji, JSON.stringify(details));
            items.push(item);
        }
        
        return items;
    }

    static parseOthers(data) {
        const skip = 3;
        const items = [];
        for (let i = skip; i < data.values.length; i++) {
            const values = data.values[i];
            const id = values[0];
            const itemId = `other-${id}`;

            if (!values[0]) {
                continue;
            }
            
            const name = values[1]?.trim();
            const tier = values[2]?.trim();
            const price = ItemSyncService.parsePrice(values[3]);
            const weight = Number(values[4]?.trim());
            const description = values[5]?.trim();
            const imgUrl = ItemSyncService.getUrl(values[6]);
            const emoji = values[7].trim();

            const item = new Item(itemId, name, null, "other", description, price, tier, weight, imgUrl, emoji, "{}");
            items.push(item);
        }
        
        return items;
    }

    static parseUniqueItems(data) {
        const skip = 3;
        const items = [];
        for (let i = skip; i < data.values.length; i++) {
            const values = data.values[i];
            const id = values[0];
            const itemId = `unique-${id}`;

            if (!values[0]) {
                continue;
            }
            
            const name = values[1]?.trim();
            const level = values[4].trim();
            const itemType = values[2]?.trim();
            const tier = values[3]?.trim();
            const description = values[5]?.trim();
            const imgUrl = ItemSyncService.getUrl(values[11]);
            const emoji = values[12].trim();

            const runes = [ values[6]?.trim(), values[7]?.trim(), values[8]?.trim(), values[9]?.trim(), values[10]?.trim() ];
            const details = { itemType, runes };

            const item = new Item(itemId, name, level, "unique", description, null, tier, NOT_APPLICABLE_TOKEN, imgUrl, emoji, JSON.stringify(details));
            items.push(item);
        }
        
        return items;
    }

    static parsePrice(data) {
        let match = /(\d+(?:\.\d+)?)([kK]|[mM])?/.exec(data); 
        
        // ex: 4.5k = 4500, 31.1k = 31100, 1k = 1000, 500 = 500
        if (match) {
            const num = Number(match[1]);
            if (!match[2]) {
                return num;
            }

            switch (match[2].toLocaleLowerCase()) {
                case "m":
                    return num * 1_000_000;
                case "k":
                    return num * 1_000;
            }
        }

        Logger.warn(`Could not parse item price: ${data}`);
        return 0;
    }

    static getUrl(str) {
        if (!str || str === NOT_APPLICABLE_TOKEN) {
            return "";
        }
        
        const url = str.trim();
        if(isValidUrl(url)) {
            return url;
        }

        Logger.warn(`${str} is not a valid URL`);
        return "";
    }
}

module.exports = ItemSyncService;
