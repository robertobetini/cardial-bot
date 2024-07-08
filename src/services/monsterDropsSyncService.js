const https = require("https");

const MonsterService = require("./monsterService");
const MonsterDropsService = require("./monsterDropsService");
const ItemService = require("./itemService");

const Monster = require("../models/monster");
const MonsterDrop = require("../models/monsterDrop");

const Logger = require("../logger");
const { SilentError } = require("../errors/silentError");
const { isValidUrl } = require("../utils");

const SHEETS = [ "Mobs-Planices Desoladas" ];
const FETCH_SHEET_URL_TEMPLATE = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEET_ID_MONSTERS}/values/{SHEET_NAME}?key=${process.env.GOOGLE_API_KEY}`;

class MonsterDropsSyncService {
    static async sync() {
        MonsterDropsService.deleteAll();
        MonsterService.deleteAll();

        const promises = [];
        for (const sheet of SHEETS) {
            const url = FETCH_SHEET_URL_TEMPLATE.replace("{SHEET_NAME}", sheet);

            const promise = new Promise((resolve, reject) => 
                https.get(url, (res) => {
                    if (res.statusCode >= 400) {
                        reject(new SilentError(`Failed to fetch google sheets '${sheet}' with status ${res.statusCode}`));
                    }

                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk) => rawData += chunk);
                    res.on('end', () => {
                        try {
                            const data = JSON.parse(rawData);
                            const [monsters, drops] = MonsterDropsSyncService.parseMonster(sheet, data);
                            MonsterService.batchInsert(monsters);
                            MonsterDropsService.batchInsert(drops);
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

    static parseMonster(sheet, data) {
        const skip = 2;
        const monsters = [];
        const drops = [];
        let lastMonster = {};
        for (let i = skip; i < data.values.length; i++) {
            const values = data.values[i];
            const monsterId = `${sheet}-${i - skip}`;

            const name = values[0]?.trim();
            const baseGold= Number(values[6]?.trim());
            const baseExp = Number(values[7]?.trim());
            const quantity = values[1].trim();
            const gold = Number(values[3].trim());
            const itemName = values[2].trim();
            
            if (!itemName || !quantity) {
                break;
            }
            if (name) {
                const monster = new Monster(monsterId, name, baseGold, baseExp);
                lastMonster = monster;
                monsters.push(monster);
            }
            
            const [diceMin, diceMax] = values[5].split("-").map(v => Number(v?.trim()));

            const item = ItemService.like(itemName, 1, true)[0];
            if (!item) {
                Logger.warn("Item not found:\n" + 
                    `Monster   - ${lastMonster.name}\n` +
                    `Item name - ${itemName}`);
                continue;
            }
            
            const drop = new MonsterDrop(lastMonster.id, item.id, quantity, gold, diceMin, diceMax);
            drops.push(drop);
        }
        
        return [monsters, drops];
    }

    static getUrl(str) {
        if (!str) {
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

module.exports = MonsterDropsSyncService;
