CREATE TABLE IF NOT EXISTS ATTRIBUTES (
    userId VARCHAR(64) NOT NULL,
    guildId VARCHAR(64) NOT NULL, 

    `FOR` INT, 
    DEX INT, 
    CON INT, 
    WIS INT, 
    CHA INT,
    availablePoints INT,
    firstAttributionDone BOOLEAN,

    FOREIGN KEY (userId, guildId) REFERENCES USERS(userId, guildId)
);
