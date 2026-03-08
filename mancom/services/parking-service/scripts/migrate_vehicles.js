const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

const ignoreColumnExistsError = (err) => {
    if (err && err.message.includes('duplicate column name')) {
        return;
    }
    if (err) {
        console.error("Migration error:", err.message);
    } else {
        console.log("Column added successfully or already matches.");
    }
};

db.serialize(() => {
    console.log("Migrating vehicles table...");

    db.run(`ALTER TABLE vehicles ADD COLUMN member_id TEXT DEFAULT ''`, ignoreColumnExistsError);
    db.run(`ALTER TABLE vehicles ADD COLUMN user_type TEXT CHECK (user_type IN ('regular', 'staff'))`, ignoreColumnExistsError);
    db.run(`ALTER TABLE vehicles ADD COLUMN department TEXT`, ignoreColumnExistsError);

    // Wait a bit
    setTimeout(() => {
        console.log("Migration attempts completed.");
    }, 1000);
});
