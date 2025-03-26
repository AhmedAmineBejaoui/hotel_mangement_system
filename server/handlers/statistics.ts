import express from "express";
import { storage } from "../storage";
import { logger } from "../middlewares/log";

const router = express.Router();

// Get dashboard overview statistics
router.get("/statistics/dashboard", async (req, res, next) => {
  try {
    // Room occupancy rate
    const occupancyRate = await storage.getOccupancyRate();
    
    // Recent bookings
    const recentBookings = await storage.getRecentBookings(4);
    const bookingsByStatus = await storage.countBookingsByStatus();
    
    // Room statistics
    const roomsByStatus = await storage.countRoomsByStatus();
    const roomsByType = await storage.countRoomsByType();
    
    // Booking by room type
    const bookingsByRoomType = await storage.getTopRoomTypes();
    
    // Revenue statistics
    const totalRevenue = await storage.getTotalRevenue();
    
    // Staff activities
    const recentActivities = await storage.getStaffActivities(5);
    
    // Combined statistics
    const stats = {
      occupancyRate,
      totalRevenue,
      newBookings: bookingsByStatus.find(s => s.status === 'confirmed')?.count || 0,
      checkedInGuests: bookingsByStatus.find(s => s.status === 'checked_in')?.count || 0,
      roomStats: {
        roomsByStatus,
        roomsByType
      },
      bookingStats: {
        bookingsByStatus,
        bookingsByRoomType
      },
      recentBookings,
      recentActivities
    };
    
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Get booking statistics by period
router.get("/statistics/bookings/:period", async (req, res, next) => {
  try {
    const period = req.params.period; // 'daily', 'weekly', 'monthly'
    
    const bookingData = await storage.getRevenueByPeriod(period);
    
    res.json(bookingData);
  } catch (error) {
    next(error);
  }
});

// Get room occupancy statistics
router.get("/statistics/rooms/occupancy", async (req, res, next) => {
  try {
    const occupancyRate = await storage.getOccupancyRate();
    const roomsByStatus = await storage.countRoomsByStatus();
    
    res.json({
      occupancyRate,
      roomsByStatus
    });
  } catch (error) {
    next(error);
  }
});

// Get popular room types
router.get("/statistics/rooms/popular", async (req, res, next) => {
  try {
    const popularRoomTypes = await storage.getTopRoomTypes();
    
    res.json(popularRoomTypes);
  } catch (error) {
    next(error);
  }
});

export const statisticsRoutes = router