const express = require('express');
const router = express.Router();
const { prisma } = require('@mancom/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Helper to get current config
const getQRConfig = async () => {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'qr_generation_config' }
        });
        return setting ? JSON.parse(setting.value) : null;
    } catch (e) {
        console.error("Error fetching/parsing system settings:", e);
        return null; // Fail safe to default/null
    }
};

// Public endpoint to check if QR generation is allowed
router.get('/qr-status', async (req, res) => {
    try {
        const config = await getQRConfig();
        if (!config) return res.json({ allowed: true, message: 'Default enabled' });

        let allowed = false;
        let message = '';

        if (config.mode === 'manual') {
            allowed = config.enabled;
            message = allowed ? 'QR Generation is enabled' : 'QR Generation is currently disabled by Admin';
        } else if (config.mode === 'scheduler') {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

            const [startHour, startMin] = config.startTime.split(':').map(Number);
            const [endHour, endMin] = config.endTime.split(':').map(Number);

            const startTotal = startHour * 60 + startMin;
            const endTotal = endHour * 60 + endMin;

            if (currentTime >= startTotal && currentTime <= endTotal) {
                allowed = true;
                message = `QR Generation is active (Schedule: ${config.startTime} - ${config.endTime})`;
            } else {
                allowed = false;
                message = `QR Generation is only allowed between ${config.startTime} and ${config.endTime}`;
            }
        }

        res.json({ allowed, message, config });
    } catch (error) {
        console.error('Error fetching QR status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin endpoint to update settings
router.put('/qr-config', authenticateToken, authorizeRole(['superadmin', 'admin']), async (req, res) => {
    try {
        const { enabled, mode, startTime, endTime } = req.body;

        // Validate input
        if (mode !== 'manual' && mode !== 'scheduler') {
            return res.status(400).json({ error: 'Invalid mode' });
        }

        const newConfig = {
            enabled: enabled === true,
            mode,
            startTime: startTime || '09:00',
            endTime: endTime || '17:00'
        };

        const value = JSON.stringify(newConfig);

        await prisma.systemSetting.upsert({
            where: { key: 'qr_generation_config' },
            update: { value },
            create: { key: 'qr_generation_config', value }
        });

        res.json({ message: 'Settings updated successfully', config: newConfig });
    } catch (err) {
        console.error('Error updating config:', err);
        return res.status(500).json({ error: 'Failed to update settings' });
    }
});

module.exports = router;
