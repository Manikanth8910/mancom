const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));
const { encrypt, decrypt } = require('./utils/crypto');

const targetEmail = 'panugantimanikanth8910@gmail.com';
const targetRole = 'superadmin';

db.serialize(() => {
    const encryptedEmail = encrypt(targetEmail);
    console.log(`Target Email: ${targetEmail}`);
    console.log(`Encrypted Email (for search): ${encryptedEmail}`);

    // Try finding by encrypted email first (standard way) or plaintext (legacy/error)
    db.get("SELECT id, username, role FROM users WHERE email = ? OR email = ?", [encryptedEmail, targetEmail], (err, row) => {
        if (err) {
            console.error("Error finding user:", err);
            return;
        }

        if (!row) {
            console.log("User not found! Please register the user first.");
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
