import express from "express";
import { storage } from "../storage";
import { insertPaymentSchema } from "@shared/schema";
import { validateRequest } from "../middlewares/validate";
import { generatePaymentId } from "../middlewares/idGenerator";
import { logger } from "../middlewares/log";

const router = express.Router();

// Get all payments with pagination and filter by status
router.get("/payments", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    
    const paymentsWithDetails = await storage.getPaymentsWithDetails(page, limit, status);
    const totalPayments = paymentsWithDetails.length; // Simplified for now
    
    res.json({
      data: paymentsWithDetails,
      pagination: {
        page,
        limit,
        total: totalPayments,
        pages: Math.ceil(totalPayments / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get a specific payment by ID
router.get("/payments/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const payment = await storage.getPaymentById(id);
    
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    
    res.json(payment);
  } catch (error) {
    next(error);
  }
});

// Create a new payment
router.post("/payments", validateRequest(insertPaymentSchema), async (req, res, next) => {
  try {
    const paymentData = req.body;
    const paymentId = generatePaymentId();
    
    // Check if booking exists
    const booking = await storage.getBookingById(paymentData.booking_id);
    if (!booking) {
      return res.status(400).json({ message: "Booking not found" });
    }
    
    const newPayment = await storage.createPayment(paymentData, paymentId);
    
    // Create staff activity if created_by is provided
    if (paymentData.created_by) {
      const staff = await storage.getStaffById(paymentData.created_by);
      await storage.createStaffActivity({
        staff_id: paymentData.created_by,
        activity_type: 'payment_processed',
        description: `Processed payment of $${paymentData.amount} for booking ${booking.booking_id}`,
        related_entity: 'payment',
        related_id: newPayment.id
      });
    }
    
    logger.info(`New payment created: ${paymentId}`);
    
    res.status(201).json(newPayment);
  } catch (error) {
    next(error);
  }
});

// Update a payment
router.put("/payments/:id", validateRequest(insertPaymentSchema.partial()), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const paymentData = req.body;
    
    const existingPayment = await storage.getPaymentById(id);
    
    if (!existingPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    
    const updatedPayment = await storage.updatePayment(id, paymentData);
    
    logger.info(`Payment updated: ${existingPayment.payment_id}`);
    
    res.json(updatedPayment);
  } catch (error) {
    next(error);
  }
});

// Delete a payment
router.delete("/payments/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    const existingPayment = await storage.getPaymentById(id);
    
    if (!existingPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    
    await storage.deletePayment(id);
    
    logger.info(`Payment deleted: ${existingPayment.payment_id}`);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get total revenue
router.get("/revenue", async (req, res, next) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    const totalRevenue = await storage.getTotalRevenue(startDate, endDate);
    
    res.json({ revenue: totalRevenue });
  } catch (error) {
    next(error);
  }
});

export const paymentRoutes = router;
