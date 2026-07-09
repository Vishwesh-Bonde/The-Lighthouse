const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const availabilityService = require('../services/availabilityService');
const emailService = require('../services/emailService');

// @desc    Get available slots
// @route   GET /api/reservations/slots
// @access  Public
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date, guests } = req.query;

    if (!date || !guests) {
      return res.status(400).json({
        success: false,
        error: 'Please provide date and guests'
      });
    }

 
    const guestsNum = parseInt(guests, 10);
    if (Number.isNaN(guestsNum) || guestsNum <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid guests value' });
    }

    const result = await availabilityService.getAvailableSlots(date, guests);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create reservation
// @route   POST /api/reservations
// @access  Private
exports.createReservation = async (req, res) => {
  try {
    const { date, time, guests, specialRequests } = req.body;

    // Basic validation to avoid malformed requests
    if (!date || !time || !guests) {
      return res.status(400).json({ success: false, error: 'Missing date, time, or guests' });
    }

    const guestsNum = parseInt(guests, 10);
    if (Number.isNaN(guestsNum) || guestsNum <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid guests count' });
    }

    // Prevent past-date reservations
    const requestedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (requestedDate < today) {
      return res.status(400).json({ success: false, error: 'Reservation date must be today or in the future' });
    }

    // Validate user's email
    const email = (req.user && req.user.email) || '';
    const emailRe = /^\S+@\S+\.\S+$/;
    if (!emailRe.test(String(email).toLowerCase())) {
      return res.status(400).json({ success: false, error: 'User email is invalid. Please verify your account email.' });
    }

    // Sanitize special requests
    const cleanedSpecialRequests = typeof specialRequests === 'string' ? specialRequests.trim().slice(0, 1000) : '';

    // Check availability
    const availability = await availabilityService.getAvailableSlots(date, guests);
    const selectedSlot = availability.data.slots.find(s => s.time === time);
    
    if (!selectedSlot || !selectedSlot.available) {
      return res.status(400).json({
        success: false,
        error: 'Selected time slot is not available'
      });
    }

    
    const availableTables = await Table.find({
      capacity: { $gte: parseInt(guests) },
      isActive: true
    });

    let assignedTable = null;
    for (const table of availableTables) {
      const isAvailable = await availabilityService.checkAvailability(table._id, date, time);
      if (isAvailable) {
        assignedTable = table;
        break;
      }
    }

    if (!assignedTable) {
      return res.status(400).json({
        success: false,
        error: 'No table available for this time slot'
      });
    }

    // Create reservation
    const reservation = await Reservation.create({
      user: req.user.id,
      table: assignedTable._id,
      date: new Date(date),
      time,
      guests: guestsNum,
      specialRequests: cleanedSpecialRequests,
      status: 'confirmed'
    });

    // Send confirmation email
    // Send confirmation email (emailService logs if not configured)
    await emailService.sendReservationConfirmation(req.user.email, {
      date,
      time,
      guests: guestsNum,
      specialRequests: cleanedSpecialRequests
    });

    res.status(201).json({
      success: true,
      data: reservation,
      message: 'Reservation confirmed! Check your email for details.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get user reservations
// @route   GET /api/reservations
// @access  Private
exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user.id })
      .populate('table', 'tableNumber capacity section')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Cancel reservation
// @route   DELETE /api/reservations/:id
// @access  Private
exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found'
      });
    }

    // Check ownership
    if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this reservation'
      });
    }

    // Check if reservation is in the future
    const reservationDate = new Date(reservation.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (reservationDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel past reservations'
      });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Reservation cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};