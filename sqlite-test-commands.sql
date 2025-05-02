.open test.db 
CREATE TABLE IF NOT EXISTS test_table (id INTEGER PRIMARY KEY, name TEXT); 
INSERT INTO test_table (name) VALUES ('Test Entry'); 
SELECT * FROM test_table; 
.quit 
