const express = require('express');
const router = express.Router();
const ParkingSlot = require('../models/ParkingSlot');
const ParkingSession = require('../models/ParkingSession');
const Vehicle = require('../models/Vehicle');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// --- Slots Management ---

// Get all slots
router.get('/slots', authenticateToken, async (req, res) => {
    try {
        const allowedRoles = ['admin', 'superadmin', 'security'];
        // If user has privilege, return detailed occupancy info
        if (allowedRoles.includes(req.user.role)) {
            const slots = await ParkingSlot.findAllWithOccupancy();
            return res.json(slots);
        }

        // Otherwise return basic slot info
        const slots = await ParkingSlot.findAll();
        res.json(slots);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new slot (Admin only)
router.post('/slots', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const slot = await ParkingSlot.create(req.body);
        res.status(201).json(slot);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update slot status (maintenance etc) - Admin only normally, but simple for now
// Not strictly needed if automated by sessions, but good for manual overrides
router.put('/slots/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { is_occupied } = req.body;
        const result = await ParkingSlot.updateStatus(req.params.id, is_occupied);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- Sessions (Entry/Exit) Management ---

// Entry: Start a session
router.post('/sessions/entry', authenticateToken, authorizeRole(['admin', 'staff']), async (req, res) => {
    try {
        const { vehicle_number, slot_id } = req.body;

        // 1. Find vehicle by number
        const vehicle = await Vehicle.findByVehicleNumber(vehicle_number);
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not registered' });
        }

        // 2. Check if slot is available
        // (This check assumes the frontend/user picked a valid slot, but good to verify)
        // For simplicity, we trust the input or handle DB errors if constraint fails.

        // 3. Start Session
        const session = await ParkingSession.start(vehicle.id, slot_id);

        // 4. Mark slot as occupied
        await ParkingSlot.updateStatus(slot_id, true);

        res.status(201).json({ message: 'Entry recorded', session });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Exit: End a session
router.post('/sessions/exit', authenticateToken, authorizeRole(['admin', 'staff']), async (req, res) => {
    try {
        const { slot_id } = req.body;

        // 1. Find active session for this slot
        const session = await ParkingSession.findActiveBySlot(slot_id);
        if (!session) {
            return res.status(404).json({ error: 'No active session for this slot' });
        }

        // 2. Calculate Fee
        const entryTime = new Date(session.entry_time);
        const exitTime = new Date();
        const durationHours = (exitTime - entryTime) / (1000 * 60 * 60);
        const hourlyRate = 10; // Simple flat rate for now
        let fee = Math.round(durationHours * hourlyRate);
        if (fee < 10) fee = 10; // Minimum fee

        // 3. End Session
        const result = await ParkingSession.end(session.id, fee);

        // 4. Free up the slot
        await ParkingSlot.updateStatus(slot_id, false);

        res.json({ message: 'Exit recorded', fee, result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get my active session (for logged in user)
router.get('/sessions/my-active', authenticateToken, async (req, res) => {
    try {
        const userEmail = req.user.email;
        // 1. Get user's vehicles
        const vehicles = await Vehicle.findAll(100, 0, userEmail); // limit 100, offset 0, filter by email

        if (!vehicles || vehicles.length === 0) {
            return res.json(null); // No vehicles, no session
        }

        // 2. Check each vehicle for active session
        // In a real app with many vehicles, a JOIN query would be better, but this is fine for now
        for (const vehicle of vehicles) {
            const session = await ParkingSession.findActiveByVehicle(vehicle.id);
            if (session) {
                return res.json(session); // Return the first active session found
            }
        }

        res.json(null); // No active session found
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get active sessions
router.get('/sessions/active', authenticateToken, async (req, res) => {
    try {
        // If query param slot_id is present
        if (req.query.slot_id) {
            const session = await ParkingSession.findActiveBySlot(req.query.slot_id);
            return res.json(session || {});
        }
        res.status(400).json({ error: "Not implemented for all active sessions yet" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get parking stats (Public)
router.get('/stats', async (req, res) => {
    try {
        const stats = await ParkingSession.getStats();
        res.json({
            total_sessions: stats.total_sessions || 0,
            active_sessions: stats.active_sessions || 0,
            total_revenue: stats.total_revenue || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

module.exports = router;
