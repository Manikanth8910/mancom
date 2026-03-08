const express = require('express');
const router = express.Router();
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Vehicle = require('../models/Vehicle');
const { prisma } = require('@mancom/database');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Apply authentication middleware to all export routes
router.use(authenticateToken);

// GET /api/exports/logs/csv - Export parking logs (entry/exit) as CSV
router.get('/logs/csv', authorizeAdmin, async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;

    let where = {};
    const now = new Date();

    if (period === 'daily') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      where.entryTime = { gte: startOfDay };
    } else if (period === 'monthly') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      where.entryTime = { gte: startOfMonth };
    } else if (period === 'yearly') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      where.entryTime = { gte: startOfYear };
    } else if (startDate && endDate) {
      where.entryTime = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const sessions = await prisma.parkingSession.findMany({
      where,
      include: {
        vehicle: {
          include: { user: true }
        },
        slot: true,
        scannedByEntry: true,
        scannedByExit: true
      },
      orderBy: { entryTime: 'desc' }
    });

    const tempFilePath = path.join(__dirname, `temp_logs_${Date.now()}.csv`);
    const csvWriter = createCsvWriter({
      path: tempFilePath,
      header: [
        { id: 'entry_time', title: 'Entry Time' },
        { id: 'exit_time', title: 'Exit Time' },
        { id: 'vehicle_number', title: 'Vehicle Number' },
        { id: 'vehicle_type', title: 'Vehicle Type' },
        { id: 'owner_name', title: 'Owner Name' },
        { id: 'email', title: 'Email' },
        { id: 'slot_number', title: 'Slot' },
        { id: 'security_entry', title: 'Scanned By (Entry)' },
        { id: 'security_exit', title: 'Scanned By (Exit)' }
      ]
    });

    const processedRows = sessions.map(s => ({
      entry_time: s.entryTime,
      exit_time: s.exitTime || 'Active Session',
      vehicle_number: s.vehicle?.vehicleNumber || 'N/A',
      vehicle_type: s.vehicle?.vehicleType || 'N/A',
      owner_name: s.vehicle?.ownerName || 'N/A',
      email: s.vehicle?.user?.email || 'N/A',
      slot_number: s.slot?.slotNumber || 'Unassigned',
      security_entry: s.scannedByEntry?.name || 'System/Auto',
      security_exit: s.scannedByExit?.name || 'System/Auto'
    }));

    await csvWriter.writeRecords(processedRows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="parking_logs_${period || 'custom'}.csv"`);

    const fileStream = fs.createReadStream(tempFilePath);
    fileStream.pipe(res);

    fileStream.on('end', () => {
      fs.unlink(tempFilePath, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
    });

  } catch (err) {
    console.error("Error exporting logs:", err);
    res.status(500).json({ error: "Failed to export logs" });
  }
});

// GET /api/exports/vehicles/csv
router.get('/vehicles/csv', authorizeAdmin, async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll(1000, 0);

    if (vehicles.length === 0) {
      return res.status(404).json({ error: 'No vehicles found to export' });
    }

    const tempFilePath = path.join(__dirname, `temp_vehicles_${Date.now()}.csv`);
    const csvWriter = createCsvWriter({
      path: tempFilePath,
      header: [
        { id: 'vehicle_number', title: 'Vehicle Number' },
        { id: 'vehicle_type', title: 'Vehicle Type' },
        { id: 'owner_name', title: 'Owner Name' },
        { id: 'email', title: 'Email' },
        { id: 'phone_number', title: 'Phone Number' }
      ]
    });

    await csvWriter.writeRecords(vehicles);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="vehicles_export.csv"');

    const fileStream = fs.createReadStream(tempFilePath);
    fileStream.pipe(res);
    fileStream.on('end', () => {
      fs.unlinkSync(tempFilePath);
    });

  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// GET /api/exports/vehicles/pdf
router.get('/vehicles/pdf', authorizeAdmin, async (req, res) => {
  try {
    // We use the already refactored Vehicle.findAll which uses Prisma
    const vehicles = await Vehicle.findAll(1000, 0);

    if (vehicles.length === 0) {
      return res.status(404).json({ error: 'No vehicles found to export' });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="vehicles_export.pdf"`);

    doc.pipe(res);
    doc.fontSize(20).text('VNR Parking Pilot - Vehicle Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    const tableTop = 150;
    const colWidths = [100, 60, 100, 80, 160];
    let currentY = tableTop;

    doc.font('Helvetica-Bold').fontSize(10);
    doc.rect(50, currentY - 5, 500, 25).fill('#f0f0f0').stroke();
    doc.fillColor('black');

    let xPos = 50;
    const headers = ['Number', 'Type', 'Owner', 'Phone', 'Email'];
    headers.forEach((header, i) => {
      doc.text(header, xPos + 5, currentY + 5, { width: colWidths[i], align: 'left' });
      xPos += colWidths[i];
    });

    currentY += 25;
    doc.font('Helvetica');

    vehicles.forEach((v, index) => {
      if (index % 2 === 0) doc.rect(50, currentY - 5, 500, 20).fill('#f9f9f9').stroke();

      xPos = 50;
      const rowData = [
        v.vehicle_number,
        v.vehicle_type.toUpperCase(),
        v.owner_name,
        v.phone_number || 'N/A',
        v.email || 'N/A'
      ];

      rowData.forEach((data, i) => {
        doc.fillColor('black').text(data, xPos + 5, currentY + 2, { width: colWidths[i], align: 'left' });
        xPos += colWidths[i];
      });

      currentY += 20;
      if (currentY > 750) {
        doc.addPage();
        currentY = 50;
      }
    });

    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`Total Vehicles: ${vehicles.length}`, 50, currentY + 20);

    doc.end();
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
});

// GET /api/exports/stats
router.get('/stats', authorizeAdmin, async (req, res) => {
  try {
    const stats = await Vehicle.getStats();
    res.json({
      totalVehicles: stats.total_vehicles,
      evVehicles: stats.total_ev,
      carVehicles: stats.total_cars,
      bikeVehicles: stats.total_bikes,
      exportDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Export stats error:', error);
    res.status(500).json({ error: 'Failed to get export statistics' });
  }
});

module.exports = router;
