try {
    const db = require('../database.js'); // This triggers the db.serialize block
    console.log("Successfully required database.js");

    // Allow some time for the db.run commands to execute
    setTimeout(() => {
        const sqlite3 = require('sqlite3').verbose();
        const path = require('path');
        const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../database.sqlite');
        // We can reuse the db instance or create a new connection to check

        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
            if (err) {
                console.error("Error listing tables:", err);
                process.exit(1);
            }
            const tables = rows.map(r => r.name);
            console.log("Found tables:", tables);

            const expected = ['qr_codes', 'violation_logs'];
            const missing = expected.filter(t => !tables.includes(t));

            if (missing.length === 0) {
                console.log("✅ All conflict-affected tables exist.");
                process.exit(0);
            } else {
                console.error("❌ Missing tables:", missing);
                process.exit(1);
            }
        });
    }, 2000);

} catch (e) {
    console.error("Failed to require database.js:", e);
    process.exit(1);
}
