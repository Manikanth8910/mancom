const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("Seeding parking slots...");

const slots = [];
// Car slots A-1 to A-20
for (let i = 1; i <= 20; i++) {
    slots.push({ number: `A-${i}`, type: 'car' });
}
// Bike slots B-1 to B-10
for (let i = 1; i <= 10; i++) {
    slots.push({ number: `B-${i}`, type: 'bike' });
}

db.serialize(() => {
    const stmt = db.prepare("INSERT OR IGNORE INTO parking_slots (slot_number, type, is_occupied) VALUES (?, ?, 0)");

    slots.forEach(slot => {
        stmt.run(slot.number, slot.type);
    });

    stmt.finalize((err) => {
        if (err) {
            console.error("Error seeding slots:", err);
        } else {
            console.log(`Seeded ${slots.length} parking slots.`);
        }
    });

    // Verify
    db.get("SELECT COUNT(*) as count FROM parking_slots", (err, row) => {
        console.log("Total slots in DB:", row.count);
    });
});
