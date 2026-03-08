const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Starting Role Migration...');

db.serialize(() => {
    // 1. Rename existing table
    db.run("ALTER TABLE users RENAME TO users_old", (err) => {
        if (err) {
            console.log('Table rename failed (maybe already migrated?):', err.message);
            // Proceeding carefully...
        } else {
            console.log('✅ Renamed users to users_old');
        }
    });

    // 2. Create new table with updated constraint
    // Note: Copied schema from database.js but updated CHECK constraint for role
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'security')),
      user_type TEXT CHECK (user_type IN ('regular', 'staff')),
      department TEXT,
      phone_number TEXT,
      member_id TEXT,
      profile_picture TEXT,
      google_id TEXT,
      email_verified BOOLEAN DEFAULT 0,
      phone_verified BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
        if (err) {
            console.error('❌ Failed to create new table:', err);
            process.exit(1);
        }
        console.log('✅ Created new users table with security role');
    });

    // 3. Copy data
    db.run(`
    INSERT INTO users (id, username, email, password, role, user_type, department, phone_number, member_id, profile_picture, google_id, email_verified, phone_verified, created_at)
    SELECT id, username, email, password, role, user_type, department, phone_number, member_id, profile_picture, google_id, email_verified, phone_verified, created_at
    FROM users_old
  `, (err) => {
        if (err) {
            console.error('❌ Data copy failed:', err);
            // Don't drop old table if copy failed
            process.exit(1);
        }
        console.log('✅ Data copied successfully');

        // 4. Drop old table
        db.run("DROP TABLE users_old", (err) => {
            if (err) console.error('Warning: Failed to drop users_old:', err);
            else console.log('✅ Dropped users_old');
        });
    });

});

db.close(() => {
    console.log('🎉 Migration Complete');
});
