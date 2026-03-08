const express = require('express');
const router = express.Router();
const { prisma } = require('@mancom/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Middleware to ensure only Super Admins access these routes
router.use(authenticateToken);
router.use(authorizeRole('superadmin'));

// GET /api/analytics/overview
router.get('/overview', async (req, res) => {
    try {
        const [
            totalUsers,
            activeSessions,
            revenueResult,
            totalVehicles,
            totalSlots
        ] = await Promise.all([
            prisma.user.count({ where: { role: 'resident' } }), // Mapping role 'user' to 'resident'
            prisma.parkingSession.count({ where: { status: 'active' } }),
            prisma.parkingSession.aggregate({
                _sum: { fee: true }
            }),
            prisma.parkingVehicle.count(),
            prisma.parkingSlot.count()
        ]);

        res.json({
            total_users: totalUsers,
            active_sessions: activeSessions,
            total_revenue: revenueResult._sum.fee || 0,
            total_vehicles: totalVehicles,
            total_slots: totalSlots
        });
    } catch (err) {
        console.error("Analytics Error:", err);
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
});

// GET /api/analytics/growth (User registration trend - last 12 months)
router.get('/growth', async (req, res) => {
    try {
        // Growth stats - grouping by month in PostgreSQL
        const growth = await prisma.$queryRaw`
            SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*)::int as count
            FROM "User"
            WHERE role = 'resident' AND created_at >= NOW() - INTERVAL '12 months'
            GROUP BY month
            ORDER BY month ASC
        `;

        res.json(growth);
    } catch (err) {
        console.error("Growth Analytics Error:", err);
        res.status(500).json({ error: "Failed to fetch growth stats" });
    }
});

module.exports = router;
