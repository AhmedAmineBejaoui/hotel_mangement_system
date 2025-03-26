import { Request, Response, NextFunction } from "express";
import winston from "winston";

// Create Winston logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'hotel-management' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

// Middleware to log HTTP requests
export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  const startTime = new Date().getTime();
  
  // Log request details
  const requestInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  };
  
  // Log after response is sent
  res.on('finish', () => {
    const responseTime = new Date().getTime() - startTime;
    
    const responseInfo = {
      ...requestInfo,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`
    };
    
    // Log at appropriate level based on status code
    if (res.statusCode >= 500) {
      logger.error('Server Error', responseInfo);
    } else if (res.statusCode >= 400) {
      logger.warn('Client Error', responseInfo);
    } else {
      logger.info('Request completed', responseInfo);
    }
  });
  
  next();
};

// Export the logger for use in other parts of the application
export { logger };
