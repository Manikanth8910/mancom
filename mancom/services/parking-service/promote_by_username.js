const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

const targetUsername = 'mani12';
const targetRole = 'superadmin';

db.serialize(() => {
    console.log(`Target Username: ${targetUsername}`);

    db.get("SELECT id, username, role FROM users WHERE username = ?", [targetUsername], (err, row) => {
        if (err) {
            console.error("Error finding user:", err);
            return;
        }

        if (!row) {
            console.log("User not found (by username)! Please tell the user to register first.");
            return;
        }

        console.log(`User found: ID=${row.id}, Username=${row.username}, Current Role=${row.role}`);

        if (row.role === targetRole) {
            console.log("User is already a superadmin.");
            return;
        }

        db.run("UPDATE users SET role = ? WHERE id = ?", [targetRole, row.id], function (updateErr) {
            if (updateErr) {
                console.error("Error updating role:", updateErr);
            } else {
                console.log(`Success! Updated user ${row.username} (ID: ${row.id}) to ${targetRole}.`);
            }
        });
    });
});
