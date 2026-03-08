const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Database setup
const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const createAdmin = async () => {
    const adminUser = {
        username: 'AdminUser',
        email: 'admin@parking.com',
        password: 'admin123', // Default password
        role: 'admin',
        phoneNumber: '9999999999',
        memberId: 'ADMIN001',
        department: 'ADMIN',
        user_type: 'staff'
    };

    try {
        const hashedPassword = await bcrypt.hash(adminUser.password, 10);

        db.serialize(() => {
            // Check if user exists
            db.get("SELECT * FROM users WHERE email = ?", [adminUser.email], (err, row) => {
                if (err) {
                    console.error("Error checking user:", err);
                    return;
                }

                if (row) {
                    // Update existing user to be admin with new password
                    console.log("User exists. Updating to Admin...");
                    db.run("UPDATE users SET password = ?, role = ?, username = ? WHERE email = ?",
                        [hashedPassword, 'admin', adminUser.username, adminUser.email],
                        function (err) {
                            if (err) console.error("Error updating admin:", err);
                            else console.log(`✅ Admin updated successfully.\nEmail: ${adminUser.email}\nPassword: ${adminUser.password}`);
                        }
                    );
                } else {
                    // Create new admin user
                    console.log("Creating new Admin user...");
                    db.run(`INSERT INTO users (username, email, password, role, phone_number, member_id, department, user_type) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [adminUser.username, adminUser.email, hashedPassword, 'admin', adminUser.phoneNumber, adminUser.memberId, adminUser.department, adminUser.user_type],
                        function (err) {
                            if (err) console.error("Error creating admin:", err);
                            else console.log(`✅ Admin created successfully.\nEmail: ${adminUser.email}\nPassword: ${adminUser.password}`);
                        }
                    );
                }
            });
        });
    } catch (error) {
        console.error("Error hashing password:", error);
    }
};

createAdmin();
