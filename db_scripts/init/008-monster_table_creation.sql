CREATE TABLE IF NOT EXISTS MONSTERS (
    id VARCHAR(128) NOT NULL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    queryName VARCHAR(128) NOT NULL,
    description VARCHAR(1024),
    level INT,
    quantity VARCHAR(64),
    HP INT,
    CA INT,
    hits INT,
    vulnerability VARCHAR(128),
    resistance VARCHAR(128),
    immunity VARCHAR(128),
    baseGold INT NOT NULL,
    baseExp INT NOT NULL
);
