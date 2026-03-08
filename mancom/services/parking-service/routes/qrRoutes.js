const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const QRCode = require('../models/QRCode');
const ParkingSession = require('../models/ParkingSession');
const ParkingSlot = require('../models/ParkingSlot');
const { authenticateToken } = require('../middleware/auth');
const Vehicle = require('../models/Vehicle'); // Add Vehicle model import
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');

// Configure CSV Writer
const csvWriter = createCsvWriter({
    path: path.join(__dirname, '../../parking_logs.csv'),
    header: [
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'security_name', title: 'Security Guard' },
        { id: 'vehicle_number', title: 'Vehicle Number' },
        { id: 'owner_name', title: 'Owner Name' },
        { id: 'phone_number', title: 'Phone Number' },
        { id: 'slot', title: 'Assigned Slot' },
        { id: 'status', title: 'Status' }
    ],
    append: true
});

const { prisma } = require('@mancom/database');

// Generate a new QR Code
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userEmail = req.user.email;
        const { purpose = 'entry' } = req.body; // Default to 'entry'

        // 1. Check System Settings for QR Generation
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'qr_generation_config' }
        });
        const config = setting ? JSON.parse(setting.value) : null;

        if (config) {
            if (config.mode === 'manual' && !config.enabled) {
                return res.status(403).json({
                    success: false,
                    message: 'QR Code generation is currently disabled by Admin.'
                });
            } else if (config.mode === 'scheduler') {
                const now = new Date();
                const currentTime = now.getHours() * 60 + now.getMinutes();

                const [startHour, startMin] = config.startTime.split(':').map(Number);
                const [endHour, endMin] = config.endTime.split(':').map(Number);

                const startTotal = startHour * 60 + startMin;
                const endTotal = endHour * 60 + endMin;

                if (currentTime < startTotal || currentTime > endTotal) {
                    return res.status(403).json({
                        success: false,
                        message: `QR Generation is only allowed between ${config.startTime} and ${config.endTime}.`
                    });
                }
            }
        }

        // Check if user has any registered vehicles
        const vehicles = await Vehicle.findAll(1, 0, userEmail);

        if (!vehicles || vehicles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No registered vehicles found. Please register a vehicle first.'
            });
        }

        // Generate a unique token
        const token = crypto.randomBytes(32).toString('hex');

        // Expiry time: 5 minutes from now
        const expiryTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        // Optional: Store minimal data in the code_data field if needed
        const codeData = JSON.stringify({
            fid: userId,
            timestamp: Date.now(),
            purpose: purpose // Ensure we remember if it's entry or exit
        });

        const qrCode = await QRCode.create(userId, token, expiryTime, codeData);

        res.status(201).json({
            success: true,
            qrCode: {
                token: qrCode.token,
                expiry: qrCode.expiryData,
                status: 'ACTIVE'
            }
        });
    } catch (err) {
        console.error('QR Generation Error:', err);
        res.status(500).json({ message: 'Error generating QR code' });
    }
});

// Scan/Validate QR Code (Security only)
router.post('/scan', authenticateToken, async (req, res) => {
    try {
        // Ensure user is security personnel
        if (req.user.role !== 'security' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Security personnel only' });
        }

        const { token } = req.body;
        if (!token) return res.status(400).json({ message: 'Token is required' });

        const qr = await QRCode.findByToken(token);

        if (!qr) return res.status(404).json({ message: 'Invalid QR Code' });
        if (qr.status !== 'ACTIVE') return res.status(400).json({ message: `QR Code is ${qr.status}` });

        if (new Date() > new Date(qr.expiry_time)) {
            await QRCode.markAsExpired(qr.id);
            return res.status(400).json({ message: 'QR Code has expired' });
        }

        // 1. Mark as USED
        await QRCode.markAsUsed(qr.id);

        let parsedCodeData = {};
        try {
            parsedCodeData = JSON.parse(qr.code_data || '{}');
        } catch (e) {
            console.error('Error parsing code_data', e);
        }

        const purpose = parsedCodeData.purpose || 'entry';

        // 2. Find faculty's vehicles
        const facultyVehicles = await Vehicle.findAll(10, 0, qr.email);

        // Default values
        let assignedSlot = "General Parking";
        let vehicleInfo = facultyVehicles[0] || { vehicle_number: "Unknown", model: "N/A" };
        let session = null;
        let actionStatus = 'Authorized';

        // 3. Handle Entry or Exit
        if (purpose === 'entry') {
            if (facultyVehicles.length > 0) {
                const vehicle = facultyVehicles[0];
                vehicleInfo = vehicle;

                // Find a free slot matching vehicle type
                const freeSlot = await prisma.parkingSlot.findFirst({
                    where: {
                        isOccupied: false,
                        type: vehicle.vehicle_type === 'bike' ? 'bike' : 'car'
                    }
                });

                if (freeSlot) {
                    assignedSlot = freeSlot.slot_number;
                    // Start Session
                    session = await ParkingSession.start(vehicle.id, freeSlot.id, req.user.id);
                    // Mark slot occupied
                    await ParkingSlot.updateStatus(freeSlot.id, true);
                }
            }
        } else if (purpose === 'exit') {
            actionStatus = 'Checked-Out';
            // Find active session for user
            let activeSession = null;
            if (facultyVehicles.length > 0) {
                for (const tempVehicle of facultyVehicles) {
                    activeSession = await ParkingSession.findActiveByVehicle(tempVehicle.id);
                    if (activeSession) {
                        vehicleInfo = tempVehicle; // Set vehicle info based on the one that has session
                        break;
                    }
                }
            }

            if (activeSession) {
                assignedSlot = activeSession.slot_number || "General Parking";
                const slotIdToFree = activeSession.slot_id;

                const entryTime = new Date(activeSession.entry_time);
                const exitTime = new Date();
                const durationHours = (exitTime - entryTime) / (1000 * 60 * 60);
                const hourlyRate = 10;
                let fee = Math.round(durationHours * hourlyRate);
                if (fee < 10) fee = 10;

                // End Session
                await ParkingSession.end(activeSession.id, fee, req.user.id);

                // Free up the slot
                if (slotIdToFree) {
                    await ParkingSlot.updateStatus(slotIdToFree, false);
                }
            } else {
                return res.status(400).json({ message: 'No active parking session found for exit.' });
            }
        }

        // Log to CSV
        try {
            await csvWriter.writeRecords([{
                timestamp: new Date().toISOString(),
                security_name: req.user.username,
                vehicle_number: vehicleInfo.vehicle_number,
                owner_name: vehicleInfo.owner_name || 'N/A',
                phone_number: vehicleInfo.phone_number || 'N/A',
                slot: assignedSlot,
                status: actionStatus
            }]);
        } catch (logErr) {
            console.error('Failed to log scan to CSV:', logErr);
        }

        res.json({
            success: true,
            action: purpose,
            faculty: {
                name: qr.faculty_name,
                department: qr.department,
                photo: qr.profile_picture,
                flat_number: qr.flat_number,
                block_number: qr.block_number,
                resident_type: qr.resident_type,
                ticket_id: qr.ticket_id,
                event_pass_type: qr.event_pass_type,
                access_level: qr.access_level
            },
            vehicle: vehicleInfo,
            slot: assignedSlot,
            entryTime: purpose === 'entry' ? new Date().toISOString() : undefined,
            exitTime: purpose === 'exit' ? new Date().toISOString() : undefined
        });

    } catch (err) {
        console.error('QR Scan Error:', err);
        res.status(500).json({ message: 'Error scanning QR code' });
    }
});

// Check status (for Faculty Dashboard polling)
router.get('/status/:token', authenticateToken, async (req, res) => {
    try {
        const { token } = req.params;
        const qr = await QRCode.findByToken(token);

        if (!qr) return res.status(404).json({ message: 'QR not found' });

        // Check if user owns this QR
        if (qr.faculty_id !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        let parsedCodeData = {};
        try {
            parsedCodeData = JSON.parse(qr.code_data || '{}');
        } catch (e) { }
        const purpose = parsedCodeData.purpose || 'entry';

        let slotNumber = null;
        if (qr.status === 'USED') {
            if (purpose === 'entry') {
                const vehicles = await Vehicle.findAll(10, 0, req.user.email);
                for (const v of vehicles) {
                    const session = await ParkingSession.findActiveByVehicle(v.id);
                    if (session) {
                        slotNumber = session.slot_number;
                        break;
                    }
                }
            } else if (purpose === 'exit') {
                // Return explicitly that it was an exit slot nullification
                slotNumber = null;
            }
        }

        res.json({
            status: qr.status,
            expiry: qr.expiry_time,
            slot: slotNumber,
            purpose: purpose
        });
    } catch (err) {
        res.status(500).json({ message: 'Error checking status' });
    }
});

module.exports = router;
