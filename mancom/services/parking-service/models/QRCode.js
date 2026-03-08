const { prisma } = require('@mancom/database');

class QRCode {
    static async create(facultyId, token, expiryData, codeData) {
        try {
            const qrCode = await prisma.parkingQRCode.create({
                data: {
                    userId: facultyId,
                    token,
                    expiryTime: new Date(expiryData),
                    codeData: typeof codeData === 'object' ? JSON.stringify(codeData) : codeData,
                    status: 'ACTIVE'
                }
            });
            return this._mapFromPrisma(qrCode);
        } catch (error) {
            throw error;
        }
    }

    static async findByToken(token) {
        try {
            const qrCode = await prisma.parkingQRCode.findUnique({
                where: { token },
                include: {
                    user: true
                }
            });

            if (!qrCode) return null;

            // Map to the legacy format expected by the app
            const row = {
                ...this._mapFromPrisma(qrCode),
                faculty_name: qrCode.user.name || qrCode.user.email.split('@')[0],
                email: qrCode.user.email,
                phone_number: qrCode.user.phone,
                department: null,
                profile_picture: null,
                flat_number: qrCode.user.flatId,
                block_number: null,
                resident_type: qrCode.user.role,
                ticket_id: null,
                event_pass_type: null,
                access_level: qrCode.user.role
            };

            return row;
        } catch (error) {
            throw error;
        }
    }

    static async markAsUsed(id) {
        try {
            const qrCode = await prisma.parkingQRCode.update({
                where: { id },
                data: { status: 'USED' }
            });
            return this._mapFromPrisma(qrCode);
        } catch (error) {
            throw error;
        }
    }

    static async markAsExpired(id) {
        try {
            const qrCode = await prisma.parkingQRCode.update({
                where: { id },
                data: { status: 'EXPIRED' }
            });
            return this._mapFromPrisma(qrCode);
        } catch (error) {
            throw error;
        }
    }

    static async findActiveByFaculty(facultyId) {
        try {
            const qrCode = await prisma.parkingQRCode.findFirst({
                where: {
                    userId: facultyId,
                    status: 'ACTIVE',
                    expiryTime: { gt: new Date() }
                },
                orderBy: { createdAt: 'desc' }
            });
            return qrCode ? this._mapFromPrisma(qrCode) : null;
        } catch (error) {
            throw error;
        }
    }

    static _mapFromPrisma(q) {
        if (!q) return null;
        return {
            id: q.id,
            faculty_id: q.userId,
            token: q.token,
            expiry_time: q.expiryTime,
            status: q.status,
            code_data: q.codeData,
            created_at: q.createdAt
        };
    }
}

module.exports = QRCode;
