const db = require('./database');

const email = 'panugantimanikanth8910@gmail.com';

console.log(`Attempting to promote ${email} to superadmin...`);

db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
    if (err) {
        console.error("Error fetching user:", err);
        return;
    }

    if (!row) {
        console.log(`User ${email} NOT FOUND. Please ask the user to sign up first.`);
        return;
    }

    db.run("UPDATE users SET role = 'superadmin' WHERE email = ?", [email], function (err) {
        if (err) {
            console.error("Error updating role:", err);
        } else {
            console.log(`✅ Success! ${email} is now a Super Admin.`);
            console.log(`Changes made: ${this.changes}`);
        }
    });
});
