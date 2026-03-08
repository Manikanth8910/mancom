const { prisma } = require('@mancom/database');

class ParkingSlot {
    static async create(slotData) {
        try {
            const { slot_number, type, is_ev } = slotData;
            const slot = await prisma.parkingSlot.create({
                data: {
                    slotNumber: slot_number,
                    type,
                    isEv: !!is_ev,
                    isOccupied: false
                }
            });
            return this._mapFromPrisma(slot);
        } catch (error) {
            throw error;
        }
    }

    static async findAll() {
        try {
            const slots = await prisma.parkingSlot.findMany({
                orderBy: { slotNumber: 'asc' }
            });
            return slots.map(s => this._mapFromPrisma(s));
        } catch (error) {
            throw error;
        }
    }

    static async findAllWithOccupancy() {
        try {
            const slots = await prisma.parkingSlot.findMany({
                include: {
                    sessions: {
                        where: { status: 'active' },
                        include: {
                            vehicle: {
                                include: { user: true }
                            }
                        }
                    }
                },
                orderBy: { slotNumber: 'asc' }
            });

            return slots.map(slot => {
                const activeSession = slot.sessions[0];
                return {
                    ...this._mapFromPrisma(slot),
                    entry_time: activeSession?.entryTime || null,
                    vehicle_number: activeSession?.vehicle?.vehicleNumber || null,
                    owner_name: activeSession?.vehicle?.ownerName || null,
                    phone_number: activeSession?.vehicle?.phoneNumber || null,
                    owner_email: activeSession?.vehicle?.user?.email || null,
                    department: null, // Prisma schema doesn't have department in ParkingVehicle yet
                    member_id: null   // Prisma schema doesn't have member_id in ParkingVehicle yet
                };
            });
        } catch (error) {
            throw error;
        }
    }

    static async findAvailable(type, is_ev = false) {
        try {
            const slots = await prisma.parkingSlot.findMany({
                where: {
                    type,
                    isOccupied: false,
                    ...(is_ev ? { isEv: true } : {})
                }
            });
            return slots.map(s => this._mapFromPrisma(s));
        } catch (error) {
            throw error;
        }
    }

    static async updateStatus(id, is_occupied) {
        try {
            const slot = await prisma.parkingSlot.update({
                where: { id },
                data: { isOccupied: !!is_occupied }
            });
            return this._mapFromPrisma(slot);
        } catch (error) {
            throw error;
        }
    }

    static async findBySlotNumber(slot_number) {
        try {
            const slot = await prisma.parkingSlot.findUnique({
                where: { slotNumber: slot_number }
            });
            return slot ? this._mapFromPrisma(slot) : null;
        } catch (error) {
            throw error;
        }
    }

    static _mapFromPrisma(s) {
        if (!s) return null;
        return {
            id: s.id,
            slot_number: s.slotNumber,
            type: s.type,
            is_occupied: s.isOccupied ? 1 : 0,
            is_ev: s.isEv ? 1 : 0,
            created_at: s.createdAt
        };
    }
}

module.exports = ParkingSlot;
