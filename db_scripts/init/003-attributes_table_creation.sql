CREATE TABLE IF NOT EXISTS ATTRIBUTES (
    userId VARCHAR(64) NOT NULL,
    guildId VARCHAR(64) NOT NULL, 

    `FOR` INTEGER, 
    DEX INTEGER, 
    CON INTEGER, 
    WIS INTEGER, 
    CHA INTEGER,
    availablePoints INTEGER,
    firstAttributionDone BOOLEAN,

    FOREIGN KEY (userId, guildId) REFERENCES USERS(userId, guildId)
);
