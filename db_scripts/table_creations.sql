CREATE TABLE IF NOT EXISTS USERS (
    userId VARCHAR(64) NOT NULL, 
    guildId VARCHAR(64) NOT NULL, 
    user VARCHAR(64), 
    silenceEndtime BIGINT,

    playerName VARCHAR(64),
    job VARCHAR(128),
    notes VARCHAR(1024),

    PRIMARY KEY (userId, guildId)
);

CREATE TABLE IF NOT EXISTS STATS (
    statsId INT NOT NULL AUTO_INCREMENT,
    userId VARCHAR(64) NOT NULL,
    guildId VARCHAR(64) NOT NULL, 

    totalExp INT, 
    gold INT,
    currentHP INT, maxHP INT, tempHP INT,
    currentFP INT, maxFP INT, tempFP INT,
    currentSP INT, maxSP INT, tempSP INT,
    baseDEF INT,

    PRIMARY KEY (statsId),
    CONSTRAINT FK_UserStats FOREIGN KEY (userId, guildId) REFERENCES USERS(userId, guildId)
);

CREATE TABLE IF NOT EXISTS ATTRIBUTES (
    attributesId INT NOT NULL AUTO_INCREMENT,
    userId VARCHAR(64) NOT NULL,
    guildId VARCHAR(64) NOT NULL, 

    `FOR` INT, 
    DEX INT, 
    CON INT, 
    WIS INT, 
    CHA INT,
    availablePoints INT,

    PRIMARY KEY (attributesId),
    CONSTRAINT FK_UserAttributes FOREIGN KEY (userId, guildId) REFERENCES USERS(userId, guildId)
);

CREATE TABLE IF NOT EXISTS SKILLS (
    skillsId INT NOT NULL AUTO_INCREMENT,
    userId VARCHAR(64) NOT NULL,
    guildId VARCHAR(64) NOT NULL, 

    athletics VARCHAR(64),
    acrobatics VARCHAR(64),
    jugglery VARCHAR(64),
    stealth VARCHAR(64),
    animalTraining VARCHAR(64),
    intuition VARCHAR(64),
    investigation VARCHAR(64),
    nature VARCHAR(64),
    perception VARCHAR(64),
    survivability VARCHAR(64),
    deception VARCHAR(64),
    intimidation VARCHAR(64),
    performance VARCHAR(64),
    persuasion VARCHAR(64),

    PRIMARY KEY (skillsId),
    CONSTRAINT FK_UserSkills FOREIGN KEY (userId, guildId) REFERENCES USERS(userId, guildId)
);

CREATE TABLE IF NOT EXISTS ROLES (
    roleId VARCHAR(64) NOT NULL PRIMARY KEY, 
    guildId VARCHAR(64) NOT NULL, 
    type VARCHAR(32)
);