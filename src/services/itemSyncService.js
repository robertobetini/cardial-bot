const https = require("https");

const ItemService = require("./itemService");
const MonsterDropsService = require("./monsterDropsService");
const InventoryService = require("./inventoryService");

const Item = require("../models/item");

const Logger = require("../logger");
const { SilentError } = require("../errors/silentError");
const { isValidUrl } = require("../utils");

const NOT_APPLICABLE_TOKEN = "-";
const SHEETS = ["Armas", "Escudos", "Armaduras", "Acessórios","Itens Únicos", "Consumíveis", "Outros"];
const FETCH_SHEET_URL_TEMPLATE = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEET_ID_ITEMS}/values/{SHEET_NAME}?key=${process.env.GOOGLE_API_KEY}`;

class ItemSyncService {
    static async sync() {
        Logger.info("Clearing items");
        
        InventoryService.deleteAll();
        MonsterDropsService.deleteAll();
        ItemService.deleteAll();

        Logger.info("Inserting default GOLD item");
        const goldItem = new Item("gold", "GOLD", NOT_APPLICABLE_TOKEN, NOT_APPLICABLE_TOKEN, 1, NOT_APPLICABLE_TOKEN, null, null, "{}");
        ItemService.batchUpsert([goldItem]);

        Logger.info("Fetching and updating items");
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
            const description = values[2].trim();
            const price = ItemSyncService.parsePrice(values[3]);
            const weight = Number(values[4].trim());
            const imgUrl = ItemSyncService.getUrl(values[12]);

            const damage = values[5].toLowerCase().trim();
            const damageType = values[6].trim();
            const weaponType = values[7].split(",").map(v => v.trim());
            const properties = values[8].split(",").map(v => v.trim());
            const metal = values[9].trim();
            const effects = values[10].trim();
            const strRequirement = values[11]?.trim() || NOT_APPLICABLE_TOKEN;

            const details = { damage, damageType, weaponType, properties, metal, effects, strRequirement };

            const item = new Item(itemId, name, "weapon", description, price, NOT_APPLICABLE_TOKEN, weight, imgUrl, JSON.stringify(details));
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
            const description = values[2].trim();
            const price = ItemSyncService.parsePrice(values[3]);
            const weight = Number(values[5].trim());
            const imgUrl = ItemSyncService.getUrl(values[9]);

            const CA = Number(values[4]);
            const grip = values[6].trim();
            const properties = values[7].split(",").map(v => v.trim());
            const metal = values[8].trim();

            const details = { CA, grip, properties, metal };

            const item = new Item(itemId, name, "shield", description, price, NOT_APPLICABLE_TOKEN, weight, imgUrl, JSON.stringify(details));
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
            const description = values[2].trim();
            const price = ItemSyncService.parsePrice(values[3]);
            const weight = Number(values[4].trim());
            const imgUrl = ItemSyncService.getUrl(values[11]);

            const metal = values[5].trim();
            const CA = Number(values[6]);
            const STR = Number(values[8].trim());
            const stealth = values[9].trim();
            const dexDebuff = Number(values[10].trim());

            const details = { CA, metal, STR, stealth, dexDebuff };

            const item = new Item(itemId, name, "armor", description, price, NOT_APPLICABLE_TOKEN, weight, imgUrl, JSON.stringify(details));
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
            const tier = values[2].trim();
            const description = values[3].trim();
            const price = ItemSyncService.parsePrice(values[4]);
            const weight = Number(values[5].trim());
            const imgUrl = ItemSyncService.getUrl(values[18]);

            const acessoryType = values[6].trim();
            const damage = Number(values[7].trim()) || 0;
            const slots = Number(values[8].trim()) || 0;
            const CA = Number(values[9].trim()) || 0;
            const DEX = Number(values[10].trim()) || 0;
            const WIS = Number(values[11].trim()) || 0;
            const STR = Number(values[12].trim()) || 0;
            const CHA = Number(values[13].trim()) || 0;
            const CON = Number(values[14].trim()) || 0;
            const effects = values[15].trim();
            const disvantage = values[16].trim();
            const properties = values[17]?.split(",")?.map(v => v.trim());

            const details = { acessoryType, damage, slots, CA, DEX, WIS, STR, CHA, CON, effects, disvantage, properties };

            const item = new Item(itemId, name, "acessory", description, price, tier, weight, imgUrl, JSON.stringify(details));
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
            const tier = values[2].trim();
            const description = values[3].trim();
            const weight = Number(values[4].trim());
            const price = ItemSyncService.parsePrice(values[5]);
            const imgUrl = ItemSyncService.getUrl(values[10]);

            const effects = [ values[6], values[7], values[8], values[9] ];

            const details = { effects: effects.filter(e => e) };

            const item = new Item(itemId, name, "usable", description, price, tier, weight, imgUrl, JSON.stringify(details));
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

            const item = new Item(itemId, name, "other", description, price, tier, weight, imgUrl, "{}");
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
            const itemType = values[2]?.trim();
            const tier = values[3]?.trim();
            const description = values[4]?.trim();
            const imgUrl = ItemSyncService.getUrl(values[10]);

            const runes = [ values[5]?.trim(), values[6]?.trim(), values[7]?.trim(), values[8]?.trim(), values[9]?.trim() ];
            const details = { itemType, runes };

            const item = new Item(itemId, name, "unique", description, null, tier, NOT_APPLICABLE_TOKEN, imgUrl, JSON.stringify(details));
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
