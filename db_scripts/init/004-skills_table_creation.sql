CREATE TABLE IF NOT EXISTS SKILLS (
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

    FOREIGN KEY (userId, guildId) REFERENCES USERS(userId, guildId)
);
