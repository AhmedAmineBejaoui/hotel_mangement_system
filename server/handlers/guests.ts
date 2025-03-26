import express from "express";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";
import { validateRequest } from "../middlewares/validate";
import { generateGuestId } from "../middlewares/idGenerator";
import { logger } from "../middlewares/log";

const router = express.Router();

// Get all guests with pagination and search
router.get("/guests", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    
    const guests = await storage.getGuests(page, limit, search);
    const totalGuests = await storage.countGuests();
    
    res.json({
      data: guests,
      pagination: {
        page,
        limit,
        total: totalGuests,
        pages: Math.ceil(totalGuests / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get a specific guest by ID
router.get("/guests/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const guest = await storage.getGuestById(id);
    
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }
    
    res.json(guest);
  } catch (error) {
    next(error);
  }
});

// Create a new guest
router.post("/guests", validateRequest(insertUserSchema), async (req, res, next) => {
  try {
    const guestData = req.body;
    const guestId = generateGuestId();
    
    const newGuest = await storage.createGuest(guestData, guestId);
    
    logger.info(`New guest created: ${guestId}`);
    
    res.status(201).json(newGuest);
  } catch (error) {
    next(error);
  }
});

// Update a guest
router.put("/guests/:id", validateRequest(insertUserSchema.partial()), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const guestData = req.body;
    
    const existingGuest = await storage.getGuestById(id);
    
    if (!existingGuest) {
      return res.status(404).json({ message: "Guest not found" });
    }
    
    const updatedGuest = await storage.updateGuest(id, guestData);
    
    logger.info(`Guest updated: ${existingGuest.guest_id}`);
    
    res.json(updatedGuest);
  } catch (error) {
    next(error);
  }
});

// Delete a guest
router.delete("/guests/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    const existingGuest = await storage.getGuestById(id);
    
    if (!existingGuest) {
      return res.status(404).json({ message: "Guest not found" });
    }
    
    await storage.deleteGuest(id);
    
    logger.info(`Guest deleted: ${existingGuest.guest_id}`);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export const guestRoutes = router;
