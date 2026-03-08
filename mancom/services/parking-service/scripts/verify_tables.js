const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

const tablesToCheck = ['users', 'vehicles', 'parking_slots', 'parking_sessions', 'qr_codes', 'violation_logs'];

db.serialize(() => {
    console.log("Checking for existence of tables...");
    let checkedCount = 0;
    tablesToCheck.forEach(table => {
        db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [table], (err, row) => {
            if (err) {
                console.error(`Error checking table ${table}:`, err.message);
            } else if (row) {
                console.log(`✅ Table '${table}' exists.`);
            } else {
                console.error(`❌ Table '${table}' DOES NOT exist.`);
            }
            checkedCount++;
            if (checkedCount === tablesToCheck.length) {
                console.log("Verification complete.");
            }
        });
    });
});
