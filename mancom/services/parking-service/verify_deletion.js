const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

const deletedIds = [1, 2, 8];

db.serialize(() => {
    // 1. Check if the specific IDs still exist
    const placeholders = deletedIds.map(() => '?').join(',');
    db.all(`SELECT id, username FROM users WHERE id IN (${placeholders})`, deletedIds, (err, rows) => {
        if (err) {
            console.error("Error querying deleted IDs:", err);
            return;
        }

        console.log("--- VERIFICATION OF DELETED IDs ---");
        if (rows.length === 0) {
            console.log(`SUCCESS: No users found with IDs: ${deletedIds.join(', ')}`);
        } else {
            console.log(`WARNING: The following IDs still exist:`);
            console.log(rows);
        }
        console.log("-----------------------------------");
    });

    // 2. List all remaining users to show the current state
    db.all("SELECT id, username, email, phone_number FROM users", (err, rows) => {
        if (err) {
            console.error("Error querying all users:", err);
            return;
        }

        console.log("\n--- REMAINING USERS IN DATABASE ---");
        if (rows.length === 0) {
            console.log("The users table is now empty.");
        } else {
            console.log(`Total remaining users: ${rows.length}`);
            console.table(rows.map(r => ({
                id: r.id,
                username: r.username,
                // We don't decrypt here just for a quick ID check, but it shows they are different users
                email_encrypted: r.email.substring(0, 15) + '...'
            })));
        }
        console.log("-----------------------------------");
    });
});
