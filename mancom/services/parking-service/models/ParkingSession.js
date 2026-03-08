const { prisma } = require('@mancom/database');

class ParkingSession {
    static async start(vehicle_id, slot_id, scanned_by = null) {
        try {
            const session = await prisma.parkingSession.create({
                data: {
                    vehicleId: vehicle_id,
                    slotId: slot_id,
                    status: 'active',
                    scannedByEntryId: scanned_by
                }
            });
            return this._mapFromPrisma(session);
        } catch (error) {
            throw error;
        }
    }

    static async end(id, fee, scanned_by = null) {
        try {
            const session = await prisma.parkingSession.update({
                where: { id },
                data: {
                    exitTime: new Date(),
                    fee: parseFloat(fee),
                    status: 'completed',
                    scannedByExitId: scanned_by
                }
            });
            return this._mapFromPrisma(session);
        } catch (error) {
            throw error;
        }
    }

    static async findActiveBySlot(slot_id) {
        try {
            const session = await prisma.parkingSession.findFirst({
                where: {
                    slotId: slot_id,
                    status: 'active'
                },
                include: {
                    vehicle: true
                }
            });

            if (!session) return null;

            return {
                ...this._mapFromPrisma(session),
                vehicle_number: session.vehicle.vehicleNumber,
                owner_name: session.vehicle.ownerName
            };
        } catch (error) {
            throw error;
        }
    }

    static async findActiveByVehicle(vehicle_id) {
        try {
            const session = await prisma.parkingSession.findFirst({
                where: {
                    vehicleId: vehicle_id,
                    status: 'active'
                },
                include: {
                    slot: true
                }
            });

            if (!session) return null;

            return {
                ...this._mapFromPrisma(session),
                slot_number: session.slot.slotNumber
            };
        } catch (error) {
            throw error;
        }
    }

    static async getStats() {
        try {
            const [total_sessions, revenueResult, active_sessions] = await Promise.all([
                prisma.parkingSession.count(),
                prisma.parkingSession.aggregate({
                    _sum: { fee: true }
                }),
                prisma.parkingSession.count({
                    where: { status: 'active' }
                })
            ]);

            return {
                total_sessions,
                total_revenue: revenueResult._sum.fee || 0,
                active_sessions
            };
        } catch (error) {
            throw error;
        }
    }

    static _mapFromPrisma(ps) {
        if (!ps) return null;
        return {
            id: ps.id,
            vehicle_id: ps.vehicleId,
            slot_id: ps.slotId,
            entry_time: ps.entryTime,
            exit_time: ps.exitTime,
            fee: ps.fee,
            status: ps.status,
            scanned_by_entry: ps.scannedByEntryId,
            scanned_by_exit: ps.scannedByExitId
        };
    }
}

module.exports = ParkingSession;
