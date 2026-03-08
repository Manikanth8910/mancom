const { prisma } = require('@mancom/database');

/**
 * Vehicle model class for database operations (PostgreSQL via Prisma)
 */
class Vehicle {
  /**
   * Create a new vehicle record
   */
  static async create(vehicleData) {
    try {
      const {
        vehicle_type, vehicle_number, model, color, is_ev, owner_name, email, phone_number,
        member_id, user_type, department,
        flat_number_ref, block_number_ref, userId
      } = vehicleData;

      // Find user by email if userId is not provided
      let effectiveUserId = userId;
      if (!effectiveUserId && email) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) effectiveUserId = user.id;
      }

      // If still no userId, we might have a problem if it's required in schema
      // In our schema userId is required for ParkingVehicle
      if (!effectiveUserId) {
        throw new Error('User ID or valid email required to associate vehicle');
      }

      const vehicle = await prisma.parkingVehicle.create({
        data: {
          vehicleType: vehicle_type,
          vehicleNumber: vehicle_number,
          model: model || null,
          color: color || null,
          isEv: is_ev === true || is_ev === 1,
          ownerName: owner_name,
          phoneNumber: phone_number || null,
          flatNumber: flat_number_ref || null,
          blockNumber: block_number_ref || null,
          userId: effectiveUserId
        }
      });

      return this._mapFromPrisma(vehicle);
    } catch (error) {
      console.error("Prisma Create Vehicle Error:", error.message);
      throw error;
    }
  }

  /**
   * Retrieve a vehicle record by its unique ID
   */
  static async findById(id) {
    try {
      const vehicle = await prisma.parkingVehicle.findUnique({
        where: { id }
      });
      return vehicle ? this._mapFromPrisma(vehicle) : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieve a vehicle record by its vehicle number
   */
  static async findByVehicleNumber(vehicle_number) {
    try {
      const vehicle = await prisma.parkingVehicle.findUnique({
        where: { vehicleNumber: vehicle_number }
      });
      return vehicle ? this._mapFromPrisma(vehicle) : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search vehicles across multiple fields
   */
  static async search(searchTerm) {
    try {
      const vehicles = await prisma.parkingVehicle.findMany({
        where: {
          OR: [
            { vehicleNumber: { contains: searchTerm, mode: 'insensitive' } },
            { ownerName: { contains: searchTerm, mode: 'insensitive' } },
            { phoneNumber: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
      return vehicles.map(v => this._mapFromPrisma(v));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieve all vehicles with pagination
   */
  static async findAll(limit = 50, offset = 0, email = null) {
    try {
      const where = email ? {
        user: { email: email }
      } : {};

      const vehicles = await prisma.parkingVehicle.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      });
      return vehicles.map(v => this._mapFromPrisma(v));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing vehicle record
   */
  static async update(id, updateData) {
    try {
      // Map updateData keys to Prisma keys
      const data = {};
      if (updateData.vehicle_type) data.vehicleType = updateData.vehicle_type;
      if (updateData.vehicle_number) data.vehicleNumber = updateData.vehicle_number;
      if (updateData.model !== undefined) data.model = updateData.model;
      if (updateData.color !== undefined) data.color = updateData.color;
      if (updateData.is_ev !== undefined) data.isEv = !!updateData.is_ev;
      if (updateData.owner_name) data.ownerName = updateData.owner_name;
      if (updateData.phone_number !== undefined) data.phoneNumber = updateData.phone_number;
      if (updateData.flat_number_ref !== undefined) data.flatNumber = updateData.flat_number_ref;
      if (updateData.block_number_ref !== undefined) data.blockNumber = updateData.block_number_ref;

      const vehicle = await prisma.parkingVehicle.update({
        where: { id },
        data
      });
      return this._mapFromPrisma(vehicle);
    } catch (error) {
      if (error.code === 'P2025') throw new Error('Vehicle not found');
      throw error;
    }
  }

  /**
   * Remove a vehicle record
   */
  static async delete(id) {
    try {
      await prisma.parkingVehicle.delete({
        where: { id }
      });
      return { message: 'Vehicle deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') throw new Error('Vehicle not found');
      throw error;
    }
  }

  /**
   * Retrieve aggregated statistics
   */
  static async getStats() {
    try {
      const [total_vehicles, total_ev, total_cars, total_bikes] = await Promise.all([
        prisma.parkingVehicle.count(),
        prisma.parkingVehicle.count({ where: { isEv: true } }),
        prisma.parkingVehicle.count({ where: { vehicleType: 'car' } }),
        prisma.parkingVehicle.count({ where: { vehicleType: 'bike' } })
      ]);

      return {
        total_vehicles,
        total_ev,
        total_cars,
        total_bikes
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Map Prisma object to the legacy format expected by the app
   * @private
   */
  static _mapFromPrisma(v) {
    if (!v) return null;
    return {
      id: v.id,
      vehicle_type: v.vehicleType,
      vehicle_number: v.vehicleNumber,
      model: v.model,
      color: v.color,
      is_ev: v.isEv ? 1 : 0,
      owner_name: v.ownerName,
      email: v.user?.email || null,
      phone_number: v.phoneNumber,
      flat_number_ref: v.flatNumber,
      block_number_ref: v.blockNumber,
      created_at: v.createdAt,
      updated_at: v.updatedAt
    };
  }
}

module.exports = Vehicle;
