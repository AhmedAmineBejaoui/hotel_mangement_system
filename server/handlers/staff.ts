import express from "express";
import { storage } from "../storage";
import { insertStaffSchema } from "@shared/schema";
import { validateRequest } from "../middlewares/validate";
import { generateStaffId } from "../middlewares/idGenerator";
import { logger } from "../middlewares/log";

const router = express.Router();

// Get all staff with pagination and filter by department
router.get("/staff", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const department = req.query.department as string;
    
    const staffMembers = await storage.getStaff(page, limit, department);
    const totalStaff = await storage.countStaff();
    
    res.json({
      data: staffMembers,
      pagination: {
        page,
        limit,
        total: totalStaff,
        pages: Math.ceil(totalStaff / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get a specific staff member by ID
router.get("/staff/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const staffMember = await storage.getStaffById(id);
    
    if (!staffMember) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    
    res.json(staffMember);
  } catch (error) {
    next(error);
  }
});

// Create a new staff member
router.post("/staff", validateRequest(insertStaffSchema), async (req, res, next) => {
  try {
    const staffData = req.body;
    const staffId = generateStaffId();
    
    const newStaff = await storage.createStaff(staffData, staffId);
    
    logger.info(`New staff member created: ${staffId}`);
    
    res.status(201).json(newStaff);
  } catch (error) {
    next(error);
  }
});

// Update a staff member
router.put("/staff/:id", validateRequest(insertStaffSchema.partial()), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const staffData = req.body;
    
    const existingStaff = await storage.getStaffById(id);
    
    if (!existingStaff) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    
    const updatedStaff = await storage.updateStaff(id, staffData);
    
    logger.info(`Staff member updated: ${existingStaff.staff_id}`);
    
    res.json(updatedStaff);
  } catch (error) {
    next(error);
  }
});

// Delete a staff member
router.delete("/staff/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    const existingStaff = await storage.getStaffById(id);
    
    if (!existingStaff) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    
    await storage.deleteStaff(id);
    
    logger.info(`Staff member deleted: ${existingStaff.staff_id}`);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get staff activities
router.get("/staff-activities", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const activities = await storage.getStaffActivities(limit);
    
    res.json(activities);
  } catch (error) {
    next(error);
  }
});

export const staffRoutes = router;
