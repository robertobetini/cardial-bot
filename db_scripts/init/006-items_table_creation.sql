CREATE TABLE IF NOT EXISTS ITEMS (
    id VARCHAR(128) NOT NULL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    queryName VARCHAR(128) NOT NULL,
    type VARCHAR(128) NOT NULL,
    description VARCHAR(2048),
    price INT,
    tier VARCHAR(16),
    weight INT,
    details TEXT NOT NULL
);
