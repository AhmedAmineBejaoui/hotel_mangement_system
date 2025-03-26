/**
 * Utility functions for generating custom IDs for various entities
 */

// Generate a custom guest ID in the format "guest-YYYYNNN"
export const generateGuestId = (): string => {
    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 900) + 100; // 3-digit random number
    return `guest-${currentYear}${randomNum}`;
  };
  
  // Generate a custom staff ID in the format "staff-YYYYNNN"
  export const generateStaffId = (): string => {
    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 900) + 100; // 3-digit random number
    return `staff-${currentYear}${randomNum}`;
  };
  
  // Generate a custom booking ID in the format "booking-YYYYNNN"
  export const generateBookingId = (): string => {
    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 900) + 100; // 3-digit random number
    return `booking-${currentYear}${randomNum}`;
  };
  
  // Generate a custom payment ID in the format "payment-YYYYNNN"
  export const generatePaymentId = (): string => {
    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 900) + 100; // 3-digit random number
    return `payment-${currentYear}${randomNum}`;
  };
  