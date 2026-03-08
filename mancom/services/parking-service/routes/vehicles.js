// Import required modules
const express = require('express'); // Web framework for routing
const { body, param, query, validationResult } = require('express-validator'); // Validation middleware
const Vehicle = require('../models/Vehicle'); // Vehicle model for database operations
const { sendEmail, emailTemplates } = require('../services/emailService'); // Email service for notifications
const { sendVehicleRegistrationSMS, sendSMS, smsTemplates } = require('../services/smsService'); // SMS service for notifications
const { authenticateToken, authorizeAdmin, authorizeRole } = require('../middleware/auth'); // Auth middleware
const contentAnalysisService = require('../services/contentAnalysisService'); // Content analysis service
const emailService = require('../services/emailService'); // Enhanced email service
const { sendWhatsAppMessage, sendWhatsAppImage } = require('../services/whatsappService'); // WhatsApp Service
const { prisma } = require('@mancom/database');

module.exports = (upload) => {
  // Create Express router instance
  const router = express.Router();

  // Apply authentication middleware to all vehicle routes
  router.use(authenticateToken);

  // Validation rules for vehicle data input
  const validateVehicleData = [
    body('vehicle_type').isIn(['car', 'bike']).withMessage('Vehicle type must be car or bike'),
    body('vehicle_number').isLength({ min: 1 }).trim().escape().withMessage('Vehicle number is required'),
    body('owner_name').isLength({ min: 2, max: 100 }).trim().escape().withMessage('Owner name must be between 2-100 characters'),
    body('phone_number').isLength({ min: 10, max: 15 }).trim().escape().withMessage('Phone number must be between 10-15 digits'),
    body('member_id').isLength({ min: 1 }).trim().escape().withMessage('Member ID is required'),
    body('user_type').optional().isIn(['regular', 'staff']).withMessage('User type must be regular or staff'),
    body('department').optional().isString().trim().escape(),
    body('model').optional().isString().trim().escape(),
    body('color').optional().isString().trim().escape(),
    body('is_ev').optional().isBoolean().withMessage('is_ev must be a boolean')
  ];

  // Validation rules for search queries
  const validateSearch = [
    query('q').isLength({ min: 1 }).withMessage('Search query is required')
  ];

  // Middleware to handle validation errors
  const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };

  // GET /api/vehicles - Retrieve all vehicles with optional filtering
  router.get('/', async (req, res) => {
    try {
      // Extract pagination parameters from query
      const { limit = 50, offset = 0 } = req.query;
      // Filter by user email for non-admin users, null for admins to see all
      const userEmail = req.user.role === 'superadmin' || req.user.role === 'admin' ? null : req.user.email;

      // Fetch vehicles from database with pagination and filtering
      const vehicles = await Vehicle.findAll(parseInt(limit), parseInt(offset), userEmail);
      res.json(vehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
  });

  // GET /api/vehicles/search?q=query - Search vehicles (admin only)
  router.get('/search', authorizeRole(['admin', 'security']), validateSearch, handleValidationErrors, async (req, res) => {
    try {
      const { q } = req.query; // Extract search query
      const vehicles = await Vehicle.search(q); // Perform search in database
      res.json(vehicles);
    } catch (error) {
      console.error('Error searching vehicles:', error);
      res.status(500).json({ error: 'Failed to search vehicles' });
    }
  });

  // GET /api/vehicles/stats - Retrieve vehicle statistics
  router.get('/stats', async (req, res) => {
    try {
      const stats = await Vehicle.getStats(); // Get aggregated statistics
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

  // GET /api/vehicles/:id - Retrieve specific vehicle by ID
  router.get('/:id', handleValidationErrors, async (req, res) => {
    try {
      const { id } = req.params;
      const vehicle = await Vehicle.findById(id);

      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      res.json(vehicle);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      res.status(500).json({ error: 'Failed to fetch vehicle' });
    }
  });

  // GET /api/vehicles/by-number/:vehicle_number - Retrieve vehicle by number (Admin/Security only)
  router.get('/by-number/:vehicle_number', authorizeRole(['admin', 'security']), async (req, res) => {
    try {
      const { vehicle_number } = req.params;
      const vehicle = await Vehicle.findByVehicleNumber(vehicle_number);

      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      res.json(vehicle);
    } catch (error) {
      console.error('❌ Error fetching vehicle by number:', error);
      res.status(500).json({ error: 'Failed to fetch vehicle details' });
    }
  });

  const { MODE, APP_CONFIG } = require('../config');

  // POST /api/vehicles - Create a new vehicle record
  router.post('/', validateVehicleData, handleValidationErrors, async (req, res) => {
    try {
      // Override email with authenticated user's email
      const userEmail = req.user.email;
      const vehicleData = { ...req.body, email: userEmail, userId: req.user.id };

      // Multi-tenant field mapping
      if (MODE === 'APARTMENT') {
        vehicleData.flat_number_ref = vehicleData.member_id;
        // block_number is optional for apartment vehicles
      }

      const userVehicles = await Vehicle.findAll(1000, 0, userEmail);
      if (userVehicles.length >= 2) {
        return res.status(400).json({ error: 'Maximum of 2 vehicles allowed per user' });
      }

      const existingVehicle = await Vehicle.findByVehicleNumber(vehicleData.vehicle_number);
      if (existingVehicle) {
        return res.status(409).json({ error: 'Vehicle number already registered' });
      }

      const newVehicle = await Vehicle.create(vehicleData);

      try {
        await emailService.sendVehicleRegistrationEmail(userEmail, vehicleData.owner_name, vehicleData);
      } catch (emailError) {
        console.error('⚠️ Failed to send confirmation email:', emailError.message);
      }

      if (vehicleData.phone_number) {
        try {
          await sendVehicleRegistrationSMS(vehicleData.phone_number, vehicleData.vehicle_number);
        } catch (smsError) {
          console.error('⚠️ Failed to send confirmation SMS:', smsError.message);
        }
      }

      res.status(201).json(newVehicle);
    } catch (error) {
      console.error('❌ Vehicle registration error:', error);
      res.status(500).json({
        error: 'Failed to create vehicle.',
        details: error.message
      });
    }
  });

  // PUT /api/vehicles/:id - Update an existing vehicle record
  router.put('/:id', handleValidationErrors, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const existingVehicle = await Vehicle.findById(id);
      if (!existingVehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      // Parking Security: IDOR Protection
      if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        if (existingVehicle.email !== req.user.email && existingVehicle.userId !== req.user.id) {
          return res.status(403).json({ error: 'Access denied: You can only update your own vehicles' });
        }
      }

      if (updateData.vehicle_number && updateData.vehicle_number !== existingVehicle.vehicle_number) {
        const duplicateVehicle = await Vehicle.findByVehicleNumber(updateData.vehicle_number);
        if (duplicateVehicle) {
          return res.status(409).json({ error: 'Vehicle number already registered' });
        }
      }

      const updatedVehicle = await Vehicle.update(id, updateData);
      res.json(updatedVehicle);
    } catch (error) {
      console.error('❌ Vehicle update error:', error);
      res.status(500).json({ error: 'Failed to update vehicle.' });
    }
  });

  // DELETE /api/vehicles/:id - Remove a vehicle record
  router.delete('/:id', handleValidationErrors, async (req, res) => {
    try {
      const { id } = req.params;

      const existingVehicle = await Vehicle.findById(id);
      if (!existingVehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      // Parking Security: IDOR Protection
      if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        if (existingVehicle.email !== req.user.email && existingVehicle.userId !== req.user.id) {
          return res.status(403).json({ error: 'Access denied: You can only delete your own vehicles' });
        }
      }

      await Vehicle.delete(id);
      res.json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      res.status(500).json({ error: 'Failed to delete vehicle' });
    }
  });

  // POST /api/vehicles/notify-parking
  router.post('/notify-parking', authorizeAdmin, async (req, res) => {
    try {
      const { vehicleId } = req.body;
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

      await emailService.sendParkingViolationEmail(
        vehicle.email,
        vehicle.owner_name,
        vehicle.vehicle_number,
        'Wrong Parking',
        'Your vehicle was flagged for wrong parking.'
      );

      if (vehicle.phone_number) {
        try {
          await sendSMS(vehicle.phone_number, smsTemplates.generalNotification, 'Your vehicle was flagged for wrong parking.');
        } catch (smsError) {
          console.error('Failed to send SMS:', smsError.message);
        }
      }

      res.json({ message: 'Notification sent successfully' });
    } catch (error) {
      console.error('Parking notification error:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });

  // POST /api/vehicles/notify-owner
  router.post('/notify-owner', authorizeRole(['admin', 'security']), upload.single('image'), async (req, res) => {
    try {
      const { vehicle_number, issue_type, message_text } = req.body;
      const imageFile = req.file;

      const vehicle = await Vehicle.findByVehicleNumber(vehicle_number);
      if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
      if (!vehicle.phone_number) return res.status(400).json({ error: 'Vehicle owner has no phone number' });

      let whatsappResponse;
      let imageUrl = null;

      if (imageFile) {
        imageUrl = `/uploads/${imageFile.filename}`;
        whatsappResponse = await sendWhatsAppImage(vehicle.phone_number, imageFile.path, message_text || `Violation Alert: ${issue_type}`);
      } else {
        whatsappResponse = await sendWhatsAppMessage(vehicle.phone_number, message_text);
      }

      // Send Email
      if (vehicle.email) {
        try {
          await emailService.sendParkingViolationEmail(vehicle.email, vehicle.owner_name, vehicle.vehicle_number, issue_type, message_text);
        } catch (e) {
          console.error('Email error:', e);
        }
      }

      // Log the violation in PostgreSQL
      await prisma.violationLog.create({
        data: {
          securityUserId: req.user.id,
          vehicleNumber: vehicle.vehicle_number,
          ownerName: vehicle.owner_name,
          phoneNumber: vehicle.phone_number,
          issueType: issue_type,
          messageSent: message_text,
          imageUrl: imageUrl,
          status: whatsappResponse.mock ? 'mock_sent' : 'sent'
        }
      });

      res.json({ success: true, message: 'Notification sent successfully', details: whatsappResponse });

    } catch (error) {
      console.error('❌ Notification Error:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });

  return router;
};
