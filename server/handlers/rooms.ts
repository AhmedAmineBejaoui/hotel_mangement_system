import express from "express";
import { storage } from "../storage";
import { insertRoomSchema } from "@shared/schema";
import { validateRequest } from "../middlewares/validate";
import { logger } from "../middlewares/log";

const router = express.Router();

// Get all rooms with pagination and filter by status
router.get("/rooms", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    
    const rooms = await storage.getRooms(page, limit, status);
    
    // Get total number of rooms (for pagination)
    const roomStatusCounts = await storage.countRoomsByStatus();
    const totalRooms = roomStatusCounts.reduce((sum, item) => sum + item.count, 0);
    
    res.json({
      data: rooms,
      pagination: {
        page,
        limit,
        total: totalRooms,
        pages: Math.ceil(totalRooms / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get a specific room by ID
router.get("/rooms/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const room = await storage.getRoomById(id);
    
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    
    res.json(room);
  } catch (error) {
    next(error);
  }
});

// Create a new room
router.post("/rooms", validateRequest(insertRoomSchema), async (req, res, next) => {
  try {
    const roomData = req.body;
    
    // Check if room with same number already exists
    const existingRoom = await storage.getRoomByNumber(roomData.room_number);
    
    if (existingRoom) {
      return res.status(400).json({ message: "A room with this number already exists" });
    }
    
    const newRoom = await storage.createRoom(roomData);
    
    logger.info(`New room created: ${newRoom.room_number}`);
    
    res.status(201).json(newRoom);
  } catch (error) {
    next(error);
  }
});

// Update a room
router.put("/rooms/:id", validateRequest(insertRoomSchema.partial()), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const roomData = req.body;
    
    const existingRoom = await storage.getRoomById(id);
    
    if (!existingRoom) {
      return res.status(404).json({ message: "Room not found" });
    }
    
    // If room number is being changed, check if the new number is already taken
    if (roomData.room_number && roomData.room_number !== existingRoom.room_number) {
      const roomWithSameNumber = await storage.getRoomByNumber(roomData.room_number);
      
      if (roomWithSameNumber) {
        return res.status(400).json({ message: "A room with this number already exists" });
      }
    }
    
    const updatedRoom = await storage.updateRoom(id, roomData);
    
    logger.info(`Room updated: ${existingRoom.room_number}`);
    
    res.json(updatedRoom);
  } catch (error) {
    next(error);
  }
});

// Delete a room
router.delete("/rooms/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    const existingRoom = await storage.getRoomById(id);
    
    if (!existingRoom) {
      return res.status(404).json({ message: "Room not found" });
    }
    
    await storage.deleteRoom(id);
    
    logger.info(`Room deleted: ${existingRoom.room_number}`);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get room statistics by status
router.get("/room-stats/by-status", async (req, res, next) => {
  try {
    const stats = await storage.countRoomsByStatus();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Get room statistics by type
router.get("/room-stats/by-type", async (req, res, next) => {
  try {
    const stats = await storage.countRoomsByType();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export const roomRoutes = router;
