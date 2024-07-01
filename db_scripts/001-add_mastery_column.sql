ALTER TABLE STATS ADD COLUMN totalMasteryExp INT;
UPDATE STATS SET totalMasteryExp = 0 WHERE totalMasteryExp = NULL;
