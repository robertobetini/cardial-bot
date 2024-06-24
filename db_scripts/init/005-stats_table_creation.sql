CREATE TABLE IF NOT EXISTS STATS (
    userId VARCHAR(64) NOT NULL,
    guildId VARCHAR(64) NOT NULL, 

    totalExp INT, 
    gold INT,
    currentHP INT, maxHP INT, tempHP INT,
    currentFP INT, maxFP INT, tempFP INT,
    currentSP INT, maxSP INT, tempSP INT,
    baseDEF INT,
    baseInitiative INT,

    FOREIGN KEY (userId, guildId) REFERENCES USERS(userId, guildId)
);
