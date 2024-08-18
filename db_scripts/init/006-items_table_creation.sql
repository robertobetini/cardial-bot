CREATE TABLE IF NOT EXISTS ITEMS (
    id VARCHAR(128) NOT NULL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    queryName VARCHAR(128) NOT NULL,
    level INT,
    type VARCHAR(128) NOT NULL,
    description VARCHAR(2048),
    price INT,
    tier VARCHAR(16),
    weight INT,
    imgUrl VARCHAR(1024),
    emoji VARCHAR(128),
    creator VARCHAR(128),
    details TEXT NOT NULL
);
