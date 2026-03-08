// Import required modules
const sqlite3 = require('sqlite3').verbose(); // SQLite3 database driver with verbose error messages
const path = require('path'); // Node.js path module for file path operations

// Define database file path - use environment variable or default
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath); // Create or open the database file

// Helper to ignore "duplicate column name" error
const ignoreColumnExistsError = (err) => {
  if (err && err.message.includes('duplicate column name')) {
    // It's fine, column already exists
    return;
  }
  if (err) {
    console.error("Database migration error (non-critical):", err.message);
  }
};

// Initialize database tables
db.serialize(() => { // Execute database operations sequentially
  // Create vehicles table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car', 'bike')),
      vehicle_number TEXT UNIQUE NOT NULL,
      model TEXT,
      color TEXT,
      is_ev BOOLEAN DEFAULT 0,
      owner_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone_number TEXT,
      member_id TEXT NOT NULL,
      user_type TEXT CHECK (user_type IN ('regular', 'staff')),
      department TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add phone_number column if it doesn't exist (for existing databases)
  db.run(`ALTER TABLE vehicles ADD COLUMN phone_number TEXT`, (err) => {
    ignoreColumnExistsError(err);
  });

  // Add Apartment specific columns (referencing residence)
  db.run(`ALTER TABLE vehicles ADD COLUMN flat_number_ref TEXT`, (err) => ignoreColumnExistsError(err));
  db.run(`ALTER TABLE vehicles ADD COLUMN block_number_ref TEXT`, (err) => ignoreColumnExistsError(err));

  // Create users table for authentication and vehicle registration
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'security', 'superadmin')),
      user_type TEXT CHECK (user_type IN ('regular', 'staff')),
      department TEXT,
      phone_number TEXT,
      member_id TEXT,
      profile_picture TEXT,
      email_verified BOOLEAN DEFAULT 0,
      phone_verified BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add profile_picture column if it doesn't exist (for existing databases)
  db.run(`ALTER TABLE users ADD COLUMN profile_picture TEXT`, (err) => {
    ignoreColumnExistsError(err);
  });

  // Add google_id column if it doesn't exist
  db.run(`ALTER TABLE users ADD COLUMN google_id TEXT`, (err) => {
    ignoreColumnExistsError(err);
  });

  // Add missing columns if they don't exist
  db.run(`ALTER TABLE users ADD COLUMN user_type TEXT`, (err) => ignoreColumnExistsError(err));
  db.run(`ALTER TABLE users ADD COLUMN department TEXT`, (err) => ignoreColumnExistsError(err));
  db.run(`ALTER TABLE users ADD COLUMN member_id TEXT`, (err) => ignoreColumnExistsError(err));

  // Add Apartment specific columns
  db.run(`ALTER TABLE users ADD COLUMN flat_number TEXT`, (err) => ignoreColumnExistsError(err));
  db.run(`ALTER TABLE users ADD COLUMN block_number TEXT`, (err) => ignoreColumnExistsError(err));
  db.run(`ALTER TABLE users ADD COLUMN resident_type TEXT CHECK (resident_type IN ('owner', 'tenant', 'visitor'))`, (err) => ignoreColumnExistsError(err));

  // Add Event specific columns
  db.run(`ALTER TABLE users ADD COLUMN ticket_id TEXT`, (err) => ignoreColumnExistsError(err));
  db.run(`ALTER TABLE users ADD COLUMN event_pass_type TEXT`, (err) => ignoreColumnExistsError(err));
  db.run(`ALTER TABLE users ADD COLUMN access_level TEXT`, (err) => ignoreColumnExistsError(err));

  // Create parking_slots table
  db.run(`
    CREATE TABLE IF NOT EXISTS parking_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot_number TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('car', 'bike')),
      is_occupied BOOLEAN DEFAULT 0,
      is_ev BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create parking_sessions table
  db.run(`
    CREATE TABLE IF NOT EXISTS parking_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      slot_id INTEGER NOT NULL,
      entry_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      exit_time DATETIME,
      fee DECIMAL(10, 2),
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
      scanned_by_entry INTEGER, -- ID of security guard who scanned entry
      scanned_by_exit INTEGER, -- ID of security guard who scanned exit
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
      FOREIGN KEY (slot_id) REFERENCES parking_slots(id),
      FOREIGN KEY (scanned_by_entry) REFERENCES users(id),
      FOREIGN KEY (scanned_by_exit) REFERENCES users(id)
    )
  `);

  // Add scanned_by columns if they don't exist
  db.run(`ALTER TABLE parking_sessions ADD COLUMN scanned_by_entry INTEGER`, (err) => ignoreColumnExistsError(err));
  db.run(`ALTER TABLE parking_sessions ADD COLUMN scanned_by_exit INTEGER`, (err) => ignoreColumnExistsError(err));

  // Create qr_codes table
  db.run(`
    CREATE TABLE IF NOT EXISTS qr_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      faculty_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expiry_time DATETIME NOT NULL,
      status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'USED', 'EXPIRED')),
      code_data TEXT, 
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (faculty_id) REFERENCES users(id)
    )
  `);

  // Create violation_logs table for WhatsApp notifications
  db.run(`
    CREATE TABLE IF NOT EXISTS violation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      security_user_id INTEGER,
      vehicle_number TEXT NOT NULL,
      owner_name TEXT,
      phone_number TEXT,
      issue_type TEXT,
      message_sent TEXT,
      image_url TEXT,
      status TEXT DEFAULT 'sent',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // System Settings Table
  db.run(`CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (!err) {
      // Insert default config if it doesn't exist
      const defaultConfig = JSON.stringify({
        enabled: true,
        mode: 'manual', // or 'scheduled'
        startTime: '09:00',
        endTime: '17:00'
      });
      db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('qr_generation_config', ?)`, [defaultConfig]);
    }
  });

  console.log('📊 Database tables initialized successfully'); // Log successful initialization
});

module.exports = db; // Export the database instance for use in other modules
