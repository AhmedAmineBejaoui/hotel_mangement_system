import express from "express";
import { storage } from "../storage";
import { insertBookingSchema } from "@shared/schema";
import { validateRequest } from "../middlewares/validate";
import { generateBookingId } from "../middlewares/idGenerator";
import { logger } from "../middlewares/log";

const router = express.Router();

// Get all bookings with pagination and filter by status
router.get("/bookings", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    
    const bookingsWithDetails = await storage.getBookingsWithDetails(page, limit, status);
    
    // Get total number of bookings by status (for pagination)
    const bookingStatusCounts = await storage.countBookingsByStatus();
    let totalBookings = 0;
    
    if (status) {
      const statusCount = bookingStatusCounts.find(item => item.status === status);
      totalBookings = statusCount ? statusCount.count : 0;
    } else {
      totalBookings = bookingStatusCounts.reduce((sum, item) => sum + item.count, 0);
    }
    
    res.json({
      data: bookingsWithDetails,
      pagination: {
        page,
        limit,
        total: totalBookings,
        pages: Math.ceil(totalBookings / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get recent bookings for dashboard
router.get("/bookings/recent", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const recentBookings = await storage.getRecentBookings(limit);
    
    res.json(recentBookings);
  } catch (error) {
    next(error);
  }
});

// Get a specific booking by ID
router.get("/bookings/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const booking = await storage.getBookingById(id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

// Create a new booking
router.post("/bookings", validateRequest(insertBookingSchema), async (req, res, next) => {
  try {
    const bookingData = req.body;
    const bookingId = generateBookingId();
    
    // Check if guest exists
    const guest = await storage.getGuestById(bookingData.guest_id);
    if (!guest) {
      return res.status(400).json({ message: "Guest not found" });
    }
    
    // Check if room exists
    const room = await storage.getRoomById(bookingData.room_id);
    if (!room) {
      return res.status(400).json({ message: "Room not found" });
    }
    
    // Check if room is available
    if (room.status !== 'vacant' && room.status !== 'cleaning') {
      return res.status(400).json({ message: "Room is not available for booking" });
    }
    
    const newBooking = await storage.createBooking(bookingData, bookingId);
    
    // If booking is confirmed, update room status to booked
    if (bookingData.status === 'confirmed') {
      await storage.updateRoom(room.id, { status: 'booked' });
    }
    
    // Create staff activity if created_by is provided
    if (bookingData.created_by) {
      await storage.createStaffActivity({
        staff_id: bookingData.created_by,
        activity_type: 'booking_created',
        description: `Created booking for ${guest.first_name} ${guest.last_name}, Room ${room.room_number}`,
        related_entity: 'booking',
        related_id: newBooking.id
      });
    }
    
    logger.info(`New booking created: ${bookingId}`);
    
    res.status(201).json(newBooking);
  } catch (error) {
    next(error);
  }
});

// Update a booking
router.put("/bookings/:id", validateRequest(insertBookingSchema.partial()), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const bookingData = req.body;
    
    const existingBooking = await storage.getBookingById(id);
    
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Check if status change requires room status update
    if (bookingData.status && bookingData.status !== existingBooking.status) {
      const room = await storage.getRoomById(existingBooking.room_id);
      
      if (bookingData.status === 'confirmed') {
        if (room) {
          await storage.updateRoom(room.id, { status: 'booked' });
        }
      } else if (bookingData.status === 'checked_in') {
        if (room) {
          await storage.updateRoom(room.id, { status: 'occupied' });
        }
      } else if (bookingData.status === 'checked_out') {
        if (room) {
          await storage.updateRoom(room.id, { status: 'cleaning' });
        }
      } else if (bookingData.status === 'cancelled') {
        if (room) {
          await storage.updateRoom(room.id, { status: 'vacant' });
        }
      }
    }
    
    const updatedBooking = await storage.updateBooking(id, bookingData);
    
    logger.info(`Booking updated: ${existingBooking.booking_id}`);
    
    res.json(updatedBooking);
  } catch (error) {
    next(error);
  }
});

// Delete a booking
router.delete("/bookings/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    const existingBooking = await storage.getBookingById(id);
    
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Update room status to vacant if booking is deleted
    const room = await storage.getRoomById(existingBooking.room_id);
    if (room) {
      await storage.updateRoom(room.id, { status: 'vacant' });
    }
    
    await storage.deleteBooking(id);
    
    logger.info(`Booking deleted: ${existingBooking.booking_id}`);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get booking statistics
router.get("/booking-stats", async (req, res, next) => {
  try {
    const statusCounts = await storage.countBookingsByStatus();
    
    res.json(statusCounts);
  } catch (error) {
    next(error);
  }
});

export const bookingRoutes = router;
