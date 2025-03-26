import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

// Custom error class for validation errors
export class ValidationError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

// Middleware to validate request against a Zod schema
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against schema
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        // Format the error message
        const errorMessage = error.errors.map(e => {
          return `${e.path.join('.')}: ${e.message}`;
        }).join(', ');
        
        next(new ValidationError(`Validation failed: ${errorMessage}`));
      } else {
        // Pass other errors to the error handler
        next(error);
      }
    }
  };
};
