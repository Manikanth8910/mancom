const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

const createDemoVehicle = () => {
    const facultyEmail = 'faculty@demo.com';

    db.serialize(() => {
        db.get("SELECT * FROM users WHERE email = ?", [facultyEmail], (err, user) => {
            if (err) {
                console.error("Error fetching faculty:", err);
                return;
            }
            if (!user) {
                console.error("Faculty user not found! Please run demo user creation first.");
                return;
            }

            console.log("Found faculty user:", user.email);

            const vehicle = {
                vehicle_type: 'car',
                vehicle_number: 'TS07EZ9999',
                model: 'Demo Honda City',
                color: 'Silver',
                is_ev: 0,
                owner_name: user.username,
                email: user.email,
                phone_number: user.phone_number || '9999999990',
                member_id: user.member_id || 'FAC001',
                user_type: user.user_type || 'staff',
                department: user.department || 'CSE'
            };

            db.get("SELECT id FROM vehicles WHERE vehicle_number = ?", [vehicle.vehicle_number], (err, row) => {
                if (row) {
                    console.log(`Vehicle ${vehicle.vehicle_number} already exists.`);
                } else {
                    console.log(`Creating vehicle for ${vehicle.email}...`);
                    // Note: 'employee_student_id' (cid 9) is NOT NULL in existing DB.
                    // 'member_id' (cid 14) is also present (from migration).
                    // We must populate both to satisfy constraints and consistency.
                    db.run(`
                        INSERT INTO vehicles (vehicle_type, vehicle_number, model, color, is_ev, owner_name, email, phone_number, member_id, employee_student_id, user_type, department)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [vehicle.vehicle_type, vehicle.vehicle_number, vehicle.model, vehicle.color, vehicle.is_ev, vehicle.owner_name, vehicle.email, vehicle.phone_number, vehicle.member_id, vehicle.member_id, vehicle.user_type, vehicle.department],
                        (err) => {
                            if (err) {
                                console.error("Error creating vehicle:", err);
                            } else {
                                console.log(`Successfully created vehicle ${vehicle.vehicle_number}`);
                            }
                        });
                }
            });
        });
    });
};

createDemoVehicle();
