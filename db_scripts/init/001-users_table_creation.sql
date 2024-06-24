CREATE TABLE IF NOT EXISTS USERS (
    userId VARCHAR(64) NOT NULL, 
    guildId VARCHAR(64) NOT NULL, 
    user VARCHAR(64), 
    silenceEndtime BIGINT,

    playerName VARCHAR(64),
    job VARCHAR(128),
    imgUrl VARCHAR(512),
    notes VARCHAR(1024),

    PRIMARY KEY (userId, guildId)
);
