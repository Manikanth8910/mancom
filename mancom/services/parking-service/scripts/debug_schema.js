const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

const logStream = fs.createWriteStream('schema.txt');

db.serialize(() => {
    logStream.write("=== USERS TABLE ===\n");
    db.all("PRAGMA table_info(users)", (err, rows) => {
        if (err) logStream.write("Error: " + err.message + "\n");
        else logStream.write(JSON.stringify(rows, null, 2) + "\n");

        logStream.write("\n=== VEHICLES TABLE ===\n");
        db.all("PRAGMA table_info(vehicles)", (err, rows) => {
            if (err) logStream.write("Error: " + err.message + "\n");
            else logStream.write(JSON.stringify(rows, null, 2) + "\n");

            logStream.end(); // close stream
        });
    });
});
