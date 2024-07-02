CREATE TABLE IF NOT EXISTS ITEMS (
    name VARCHAR(128) NOT NULL,
    type VARCHAR(128) NOT NULL,
    description VARCHAR(2048),
    price INT,
    tier VARCHAR(16),
    weight INT,
    details TEXT NOT NULL
);
