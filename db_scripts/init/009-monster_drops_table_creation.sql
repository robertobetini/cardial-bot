CREATE TABLE IF NOT EXISTS MONSTER_DROPS (
    monsterId VARCHAR(128) NOT NULL,
    itemId VARCHAR(128) NOT NULL,
    quantity VARCHAR(32) NOT NULL,
    gold INT,
    DICE_MIN INT NOT NULL,
    DICE_MAX INT NOT NULL,

    FOREIGN KEY (monsterId) REFERENCES MONSTERS(id),
    FOREIGN KEY (itemId) REFERENCES ITEMS(id)
);
