const https = require("https");

const MonsterService = require("./monsterService");
const DropsService = require("./dropsService");
const ItemService = require("./itemService");

const Monster = require("../models/monster");
const MonsterDrop = require("../models/monsterDrop");

const Logger = require("../logger");
const { SilentError } = require("../errors/silentError");
const { isValidUrl, hashText, unitOfWork } = require("../utils");

const DROPS_SHEETS = [ "Mobs-Planices Desoladas" ];
const BESTIARY_SHEETS = [ 
    "Monstros Camada 0 (Arredores de Elysium Nvl 1)",
    "Monstros Camada 1 (As Montanhas Nvl 2)",
    // "Monstros Camada 1 (Árvores Sussurrantes Nvl 3)",
    // "Monstros Camada 1 (Geleiras Sussurrantes Nvl 4)",
    // "Monstros Camada 1 (Dunas Sussurrantes Nvl 5)"
];
const FETCH_SHEET_URL_TEMPLATE = `https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{SHEET_NAME}?key=${process.env.GOOGLE_API_KEY}`;

class MonsterSyncService {
    static async sync() {
        await unitOfWork(MonsterSyncService.execute);
    }

    static async execute() {
        Logger.info("Clearing monsters and drops");
        DropsService.deleteAll();
        MonsterService.deleteAll();

        // make all requests asynchronously
        Logger.info("Fetching sheets");
        const bestiaryPromises = [];
        for (const sheet of BESTIARY_SHEETS) {
            const promise = MonsterSyncService.fetchSheet(process.env.GOOGLE_SHEET_ID_BESTIARY, sheet);
            bestiaryPromises.push(promise);
        }

        const dropsPromises = [];
        for (const sheet of DROPS_SHEETS) {
            const promise = MonsterSyncService.fetchSheet(process.env.GOOGLE_SHEET_ID_DROPS, sheet);
            dropsPromises.push(promise);
        }
        
        // update database
        Logger.info("Updating monsters");
        for (const result of await Promise.all(bestiaryPromises)) {
            const monsters = MonsterSyncService.parseMonster(result.sheet, result.data);
            MonsterService.batchInsert(monsters);
        }

        Logger.info("Updating monster baseExp, baseGold and drops");
        for (const result of await Promise.all(dropsPromises)) {
            const [monsters, drops] = MonsterSyncService.parseMonsterDrops(result.data);
            MonsterService.batchUpdate(monsters);
            DropsService.batchInsert(drops);
        }
    }

    static async fetchSheet(sheetId, pageName) {
        const url = FETCH_SHEET_URL_TEMPLATE
            .replace("{SHEET_ID}", sheetId)
            .replace("{SHEET_NAME}", pageName);

        return new Promise((resolve, reject) => 
            https.get(url, (res) => {
                if (res.statusCode >= 400) {
                    reject(new SilentError(`Failed to fetch google sheets '${pageName}' with status ${res.statusCode}`));
                }

                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => rawData += chunk);
                res.on('end', () => {
                    try {
                        const data = JSON.parse(rawData);
                        resolve({ data: data, sheet: pageName });
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
    }

    static parseMonster(sheet, data) {
        const skip = 2;
        const monsters = [];
        const sheetHash = hashText(sheet).substring(0, 10);
        for (let i = skip; i < data.values.length; i++) {
            const values = data.values[i];
            const monsterId = `${sheetHash}-${i - skip}`;

            const level = Number(values[0]?.trim()); 
            const quantity = values[1].trim();
            const name = values[2]?.trim();
            const description = values[3]?.trim();
            const HP = Number(values[6]?.trim());
            const CA = Number(values[7]?.trim());
            const hits = Number(values[8]?.trim());
            const vulnerability = values[9]?.trim();
            const resistance = values[10]?.trim();
            const immunity = values[11]?.trim();
            
            const monster = new Monster(monsterId, name, description, level, quantity, HP, CA, hits, vulnerability, resistance, immunity);
            monsters.push(monster);
        }
        
        return monsters;
    }

    static parseMonsterDrops(data) {
        const skip = 2;
        const monsters = [];
        const drops = [];
        let lastMonster = {};
        for (let i = skip; i < data.values.length; i++) {
            const values = data.values[i];

            const name = values[0]?.trim();
            const baseGold= Number(values[5]?.trim());
            const baseExp = Number(values[6]?.trim());
            const quantity = values[1].trim();
            const gold = Number(values[3].trim());
            const itemName = values[2].trim();
            
            if (!itemName || !quantity) {
                break;
            }
            if (name) {
                const monster = MonsterService.like(name, 1)[0];
                if (!monster) {
                    Logger.warn(`Monster not found in bestiary: ${name}`);
                    continue;
                }
                monster.baseExp = baseExp;
                monster.baseGold = baseGold;
                monsters.push(monster);
                lastMonster = monster;
            }
            
            const [diceMin, diceMax] = values[4].split("-").map(v => Number(v?.trim()));

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

module.exports = MonsterSyncService;
