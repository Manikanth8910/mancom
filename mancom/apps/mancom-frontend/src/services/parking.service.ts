/**
 * Parking Service
 * Handles all API calls to the Parking microservice
 */

import { apiClient } from '../core/api/client';
import { API_CONFIG } from '../config/api';

const PARKING_BASE = API_CONFIG.PARKING_URL;

export interface Vehicle {
    id: number;
    vehicle_number: string;
    vehicle_type: 'car' | 'bike';
    model?: string;
    color?: string;
    is_ev: boolean;
    owner_name?: string;
    email?: string;
    phone_number?: string;
}

export interface RegisterVehicleDto {
    vehicle_type: 'car' | 'bike';
    vehicle_number: string;
    owner_name: string;
    phone_number: string;
    member_id: string;
    model?: string;
    color?: string;
    is_ev?: boolean;
}

export interface ParkingSession {
    id: number;
    vehicle_id: number;
    slot_id: number;
    entry_time: string;
    exit_time?: string;
    fee?: number;
    status: 'active' | 'completed';
    slot_number?: string;
}

export const parkingService = {
    /** Get current user's vehicles */
    getMyVehicles: async (): Promise<Vehicle[]> => {
        const res = await apiClient.get(`${PARKING_BASE}/api/vehicles`);
        return res.data;
    },

    /** Register a new vehicle */
    registerVehicle: async (dto: RegisterVehicleDto): Promise<Vehicle> => {
        const res = await apiClient.post(`${PARKING_BASE}/api/vehicles`, dto);
        return res.data;
    },

    /** Delete a vehicle */
    deleteVehicle: async (id: number): Promise<void> => {
        await apiClient.delete(`${PARKING_BASE}/api/vehicles/${id}`);
    },

    /** Generate a QR code for gate entry */
    generateQR: async (purpose: 'entry' | 'exit' = 'entry') => {
        const res = await apiClient.post(`${PARKING_BASE}/api/qr/generate`, { purpose });
        return res.data;
    },

    /** Get parking statistics */
    getStats: async () => {
        const res = await apiClient.get(`${PARKING_BASE}/api/vehicles/stats`);
        return res.data;
    },
};
