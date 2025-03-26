import type { Express } from "express";
import { createServer, type Server } from "http";
import { validateRequest } from "./middlewares/validate";
import { logRequest } from "./middlewares/log";
import { guestRoutes } from "./handlers/guests";
import { roomRoutes } from "./handlers/rooms";
import { staffRoutes } from "./handlers/staff";
import { bookingRoutes } from "./handlers/bookings";
import { paymentRoutes } from "./handlers/payments";
import { statisticsRoutes } from "./handlers/statistics";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add logging middleware
  app.use(logRequest);
  
  // Configure authentication
  setupAuth(app);

  // Register API routes
  app.use("/api", guestRoutes);
  app.use("/api", roomRoutes);
  app.use("/api", staffRoutes);
  app.use("/api", bookingRoutes);
  app.use("/api", paymentRoutes);
  app.use("/api", statisticsRoutes);

  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(status).json(message);
  });

  const httpServer = createServer(app);

  return httpServer;
}
