const express = require('express');
const router = express.Router();
const { prisma } = require('@mancom/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Middleware: Only Super Admin can access these routes
router.use(authenticateToken);
router.use(authorizeRole('superadmin'));

// GET /api/users - List all users
router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Map Prisma fields to legacy response format if needed
        const mappedUsers = users.map(user => ({
            id: user.id,
            username: user.name || 'User',
            email: user.email,
            role: user.role === 'resident' ? 'user' : user.role, // Mapping resident->user for compatibility
            user_type: user.role === 'staff' ? 'staff' : 'regular',
            created_at: user.createdAt,
            profile_picture: user.profileImage,
            phone_number: user.phone
        }));

        res.json(mappedUsers);
    } catch (err) {
        console.error("Error fetching users:", err);
        return res.status(500).json({ error: "Failed to fetch users" });
    }
});

// PUT /api/users/:id/role - Update user role
router.put('/:id/role', async (req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;

        // Map incoming roles if needed
        const roleMap = {
            'user': 'resident',
            'admin': 'admin',
            'security': 'security',
            'superadmin': 'superadmin'
        };

        const targetRole = roleMap[role] || role;

        await prisma.user.update({
            where: { id: userId },
            data: { role: targetRole }
        });

        res.json({ message: "User role updated successfully", role });
    } catch (err) {
        console.error("Error updating user role:", err);
        return res.status(500).json({ error: "Failed to update role" });
    }
});

module.exports = router;
