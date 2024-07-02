const https = require("https");

const ItemService = require("../services/itemService");

const Item = require("../models/item");

const Logger = require("../logger");
const { SilentError } = require("../errors/silentError");
const { isValidUrl } = require("../utils");

const NOT_APPLICABLE_TOKEN = "-";
const SHEETS = [
    "Armas", "Escudos", "Armaduras", 
    "Acessórios",
    "Itens Únicos", 
    "Consumíveis", 
    "Outros"
];
const FETCH_SHEET_URL_TEMPLATE = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEET_ID_ITEMS}/values/{SHEET_NAME}?key=${process.env.GOOGLE_API_KEY}`;

class GoogleSheetsService {
    static syncItems() {
        for (const sheet of SHEETS) {
            const url = FETCH_SHEET_URL_TEMPLATE.replace("{SHEET_NAME}", sheet);
            https.get(url, (res) => {
                if (res.statusCode == 403) {
                    throw SilentError("Failed to fetch google sheets with status 'Forbidden'");
                }

                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => rawData += chunk );
                res.on('end', () => {
                    try {
                        const data = JSON.parse(rawData);
                        const items = GoogleSheetsService.parseItems(sheet, data);
                        ItemService.batchUpsert(items);
                    } catch (err) {
                        Logger.error(err);
                    }
                });
            }).on("error", (err) => Logger.error(err));
        }
    }

    static parseItems(sheet, data) {
        switch(sheet) {
            case "Armas":
                return GoogleSheetsService.parseWeapons(data);
            case "Escudos":
                return GoogleSheetsService.parseShields(data);
            case "Armaduras":
                return GoogleSheetsService.parseArmors(data);
            case "Acessórios":
                return GoogleSheetsService.parseAcessories(data);
            case "Itens Únicos":
                return GoogleSheetsService.parseUniqueItems(data);
            case "Consumíveis":
                return GoogleSheetsService.parseUsables(data);
            case "Outros":
                return GoogleSheetsService.parseOthers(data);
        }
    }

    static parseWeapons(data) {
        const skip = 3;
        const items = [];
        for (let i = skip; i < data.values.length; i++) {
            const values = data.values[i];
            const itemId = `weapon-${i - skip}`;

            if (!values[0]) {
                continue;
            }

            const name = values[0].trim();
            const description = values[1].trim();
            const price = GoogleSheetsService.parsePrice(values[2]);
            const weight = Number(values[3].trim());
            const imgUrl = GoogleSheetsService.getUrl(values[11]);

            const damage = values[4].toLowerCase().trim();
            const damageType = values[5].trim();
            const weaponType = values[6].split(",").map(v => v.trim());
            const properties = values[7].split(",").map(v => v.trim());
            const metal = values[8].trim();
            const effects = values[9].trim();
            const strRequirement = values[10].trim();

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
            const itemId = `shield-${i - skip}`;

            if (!values[0]) {
                continue;
            }

            const name = values[0].trim();
            const description = values[1].trim();
            const price = GoogleSheetsService.parsePrice(values[2]);
            const weight = Number(values[4].trim());
            const imgUrl = GoogleSheetsService.getUrl(values[8]);

            const CA = Number(values[3]);
            const grip = values[5].trim();
            const properties = values[6].split(",").map(v => v.trim());
            const metal = values[7].trim();

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
            const itemId = `armor-${i - skip}`;

            if (!values[0]) {
                continue;
            }

            const name = values[0].trim();
            const description = values[1].trim();
            const price = GoogleSheetsService.parsePrice(values[2]);
            const weight = Number(values[3].trim());
            const imgUrl = GoogleSheetsService.getUrl(values[10]);

            const metal = values[4].trim();
            const CA = Number(values[5]);
            const STR = Number(values[7].trim());
            const stealth = values[8].trim();
            const dexDebuff = Number(values[9].trim());

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
            const itemId = `acessory-${i - skip}`;

            if (!values[0]) {
                continue;
            }

            const name = values[0].trim();
            const tier = values[1].trim();
            const description = values[2].trim();
            const price = GoogleSheetsService.parsePrice(values[3]);
            const weight = Number(values[4].trim());
            const imgUrl = GoogleSheetsService.getUrl(values[17]);

            const acessoryType = values[5].trim();
            const damage = Number(values[6].trim()) || 0;
            const slots = Number(values[7].trim()) || 0;
            const CA = Number(values[8].trim()) || 0;
            const DEX = Number(values[9].trim()) || 0;
            const WIS = Number(values[10].trim()) || 0;
            const STR = Number(values[11].trim()) || 0;
            const CHA = Number(values[12].trim()) || 0;
            const CON = Number(values[13].trim()) || 0;
            const effects = values[14].trim();
            const disvantage = values[15].trim();
            const properties = values[16]?.split(",")?.map(v => v.trim());

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
            const itemId = `usable-${i - skip}`;

            if (!values[0]) {
                continue;
            }
            if (values[0] === "REFEIÇÕES") {
                break;
            }

            const name = values[0].trim();
            const tier = values[1].trim();
            const description = values[2].trim();
            const weight = Number(values[3].trim());
            const price = GoogleSheetsService.parsePrice(values[4]);
            const imgUrl = GoogleSheetsService.getUrl(values[9]);

            const effects = [ values[5], values[6], values[7], values[8] ];

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
            const itemId = `other-${i - skip}`;

            if (!values[0]) {
                continue;
            }
            
            const name = values[0]?.trim();
            const price = GoogleSheetsService.parsePrice(values[1]);
            const weight = Number(values[2]?.trim());
            const description = values[3]?.trim();
            const imgUrl = GoogleSheetsService.getUrl(values[4]);

            const item = new Item(itemId, name, "other", description, price, NOT_APPLICABLE_TOKEN, weight, imgUrl, "{}");
            items.push(item);
        }
        
        return items;
    }

    static parseUniqueItems(data) {
        const skip = 3;
        const items = [];
        for (let i = skip; i < data.values.length; i++) {
            const values = data.values[i];
            const itemId = `unique-${i - skip}`;

            if (!values[0]) {
                continue;
            }
            
            const name = values[0]?.trim();
            const itemType = values[1]?.trim();
            const tier = values[2]?.trim();
            const description = values[3]?.trim();
            const imgUrl = GoogleSheetsService.getUrl(values[9]);

            const runes = [ values[4]?.trim(), values[5]?.trim(), values[6]?.trim(), values[7]?.trim(), values[8]?.trim() ];
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
        if (!str) {
            return "";
        }
        
        const url = str.trim();
        if(isValidUrl(url)) {
            return str.trim();
        }

        Logger.warn(`${str} is not a valid URL`);
        return "";
    }
}

module.exports = GoogleSheetsService;
