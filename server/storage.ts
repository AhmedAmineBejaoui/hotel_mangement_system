import { eq, and, desc, gte, lte, sql, SQL } from "drizzle-orm";
import { db } from "./db";
import {
  guests, rooms, staff, bookings, payments, staffActivities,
  type Guest, type InsertGuest, type Room, type InsertRoom,
  type Staff, type InsertStaff, type Booking, type InsertBooking,
  type Payment, type InsertPayment, type StaffActivity, type InsertStaffActivity,
  users, type User, type InsertUser
} from "@shared/schema";

// Define storage interface for all CRUD operations
export interface IStorage {
  // Users (keeping from template, might be used for auth)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Guests
  getGuests(page?: number, limit?: number, search?: string): Promise<Guest[]>;
  getGuestById(id: number): Promise<Guest | undefined>;
  getGuestByGuestId(guestId: string): Promise<Guest | undefined>;
  createGuest(guest: InsertGuest, guestId: string): Promise<Guest>;
  updateGuest(id: number, guest: Partial<InsertGuest>): Promise<Guest | undefined>;
  deleteGuest(id: number): Promise<boolean>;
  countGuests(): Promise<number>;

  // Rooms
  getRooms(page?: number, limit?: number, status?: string): Promise<Room[]>;
  getRoomById(id: number): Promise<Room | undefined>;
  getRoomByNumber(roomNumber: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room | undefined>;
  deleteRoom(id: number): Promise<boolean>;
  countRoomsByStatus(): Promise<{ status: string; count: number }[]>;
  countRoomsByType(): Promise<{ room_type: string; count: number }[]>;

  // Staff
  getStaff(page?: number, limit?: number, department?: string): Promise<Staff[]>;
  getStaffById(id: number): Promise<Staff | undefined>;
  getStaffByStaffId(staffId: string): Promise<Staff | undefined>;
  createStaff(staffMember: InsertStaff, staffId: string): Promise<Staff>;
  updateStaff(id: number, staffMember: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaff(id: number): Promise<boolean>;
  countStaff(): Promise<number>;

  // Bookings
  getBookings(page?: number, limit?: number, status?: string): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | undefined>;
  getBookingByBookingId(bookingId: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking, bookingId: string): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;
  getBookingsWithDetails(page?: number, limit?: number, status?: string): Promise<any[]>;
  countBookingsByStatus(): Promise<{ status: string; count: number }[]>;
  getRecentBookings(limit?: number): Promise<any[]>;

  // Payments
  getPayments(page?: number, limit?: number, status?: string): Promise<Payment[]>;
  getPaymentById(id: number): Promise<Payment | undefined>;
  getPaymentByPaymentId(paymentId: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment, paymentId: string): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: number): Promise<boolean>;
  getPaymentsWithDetails(page?: number, limit?: number, status?: string): Promise<any[]>;
  getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number>;

  // Staff Activities
  createStaffActivity(activity: InsertStaffActivity): Promise<StaffActivity>;
  getStaffActivities(limit?: number): Promise<any[]>;

  // Statistics
  getOccupancyRate(): Promise<number>;
  getRevenueByPeriod(period: string): Promise<any[]>;
  getTopRoomTypes(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods (keeping from template, might be used for auth)
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Guest methods
  async getGuests(page = 1, limit = 10, search?: string): Promise<Guest[]> {
    const offset = (page - 1) * limit;
    
    if (search) {
      return db.select()
        .from(guests)
        .where(
          sql`${guests.first_name} ILIKE ${`%${search}%`} OR ${guests.last_name} ILIKE ${`%${search}%`} OR ${guests.email} ILIKE ${`%${search}%`}`
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(guests.created_at));
    }
    
    return db.select()
      .from(guests)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(guests.created_at));
  }

  async getGuestById(id: number): Promise<Guest | undefined> {
    const [guest] = await db.select().from(guests).where(eq(guests.id, id));
    return guest;
  }

  async getGuestByGuestId(guestId: string): Promise<Guest | undefined> {
    const [guest] = await db.select().from(guests).where(eq(guests.guest_id, guestId));
    return guest;
  }

  async createGuest(guest: InsertGuest, guestId: string): Promise<Guest> {
    const [newGuest] = await db.insert(guests)
      .values({ ...guest, guest_id: guestId })
      .returning();
    return newGuest;
  }

  async updateGuest(id: number, guest: Partial<InsertGuest>): Promise<Guest | undefined> {
    const [updatedGuest] = await db.update(guests)
      .set({ ...guest, updated_at: new Date() })
      .where(eq(guests.id, id))
      .returning();
    return updatedGuest;
  }

  async deleteGuest(id: number): Promise<boolean> {
    const result = await db.delete(guests).where(eq(guests.id, id)).returning();
    return result.length > 0;
  }

  async countGuests(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(guests);
    return result.count;
  }

  // Room methods
  async getRooms(page = 1, limit = 10, status?: string): Promise<Room[]> {
    const offset = (page - 1) * limit;
    
    if (status) {
      return db.select()
        .from(rooms)
        .where(eq(rooms.status, status as any))
        .limit(limit)
        .offset(offset)
        .orderBy(rooms.room_number);
    }
    
    return db.select()
      .from(rooms)
      .limit(limit)
      .offset(offset)
      .orderBy(rooms.room_number);
  }

  async getRoomById(id: number): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room;
  }

  async getRoomByNumber(roomNumber: string): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.room_number, roomNumber));
    return room;
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const [newRoom] = await db.insert(rooms).values(room).returning();
    return newRoom;
  }

  async updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room | undefined> {
    const [updatedRoom] = await db.update(rooms)
      .set({ ...room, updated_at: new Date() })
      .where(eq(rooms.id, id))
      .returning();
    return updatedRoom;
  }

  async deleteRoom(id: number): Promise<boolean> {
    const result = await db.delete(rooms).where(eq(rooms.id, id)).returning();
    return result.length > 0;
  }

  async countRoomsByStatus(): Promise<{ status: string; count: number }[]> {
    const results = await db
      .select({
        status: rooms.status,
        count: sql<number>`count(*)`,
      })
      .from(rooms)
      .groupBy(rooms.status);
    
    return results;
  }

  async countRoomsByType(): Promise<{ room_type: string; count: number }[]> {
    const results = await db
      .select({
        room_type: rooms.room_type,
        count: sql<number>`count(*)`,
      })
      .from(rooms)
      .groupBy(rooms.room_type);
    
    return results;
  }

  // Staff methods
  async getStaff(page = 1, limit = 10, department?: string): Promise<Staff[]> {
    const offset = (page - 1) * limit;
    
    if (department) {
      return db.select()
        .from(staff)
        .where(eq(staff.department, department))
        .limit(limit)
        .offset(offset)
        .orderBy(staff.last_name);
    }
    
    return db.select()
      .from(staff)
      .limit(limit)
      .offset(offset)
      .orderBy(staff.last_name);
  }

  async getStaffById(id: number): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.id, id));
    return staffMember;
  }

  async getStaffByStaffId(staffId: string): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.staff_id, staffId));
    return staffMember;
  }

  async createStaff(staffMember: InsertStaff, staffId: string): Promise<Staff> {
    const [newStaff] = await db.insert(staff)
      .values({ ...staffMember, staff_id: staffId })
      .returning();
    return newStaff;
  }

  async updateStaff(id: number, staffMember: Partial<InsertStaff>): Promise<Staff | undefined> {
    const [updatedStaff] = await db.update(staff)
      .set({ ...staffMember, updated_at: new Date() })
      .where(eq(staff.id, id))
      .returning();
    return updatedStaff;
  }

  async deleteStaff(id: number): Promise<boolean> {
    const result = await db.delete(staff).where(eq(staff.id, id)).returning();
    return result.length > 0;
  }

  async countStaff(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(staff);
    return result.count;
  }

  // Booking methods
  async getBookings(page = 1, limit = 10, status?: string): Promise<Booking[]> {
    const offset = (page - 1) * limit;
    
    if (status) {
      return db.select()
        .from(bookings)
        .where(eq(bookings.status, status as any))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(bookings.created_at));
    }
    
    return db.select()
      .from(bookings)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(bookings.created_at));
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingByBookingId(bookingId: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.booking_id, bookingId));
    return booking;
  }

  async createBooking(booking: InsertBooking, bookingId: string): Promise<Booking> {
    const [newBooking] = await db.insert(bookings)
      .values({ ...booking, booking_id: bookingId })
      .returning();
    return newBooking;
  }

  async updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updatedBooking] = await db.update(bookings)
      .set({ ...booking, updated_at: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  async deleteBooking(id: number): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id)).returning();
    return result.length > 0;
  }

  async getBookingsWithDetails(page = 1, limit = 10, status?: string): Promise<any[]> {
    const offset = (page - 1) * limit;
    
    const query = db.select({
      booking_id: bookings.booking_id,
      id: bookings.id,
      guest_first_name: guests.first_name,
      guest_last_name: guests.last_name,
      guest_id: guests.guest_id,
      room_number: rooms.room_number,
      room_type: rooms.room_type,
      check_in_date: bookings.check_in_date,
      check_out_date: bookings.check_out_date,
      total_price: bookings.total_price,
      status: bookings.status,
      created_at: bookings.created_at
    })
    .from(bookings)
    .innerJoin(guests, eq(bookings.guest_id, guests.id))
    .innerJoin(rooms, eq(bookings.room_id, rooms.id))
    .orderBy(desc(bookings.created_at))
    .limit(limit)
    .offset(offset);
    
    if (status) {
      return await query.where(eq(bookings.status, status as any));
    }
    
    return await query;
  }

  async countBookingsByStatus(): Promise<{ status: string; count: number }[]> {
    const results = await db
      .select({
        status: bookings.status,
        count: sql<number>`count(*)`,
      })
      .from(bookings)
      .groupBy(bookings.status);
    
    return results;
  }

  async getRecentBookings(limit = 5): Promise<any[]> {
    return db.select({
      booking_id: bookings.booking_id,
      id: bookings.id,
      guest_first_name: guests.first_name,
      guest_last_name: guests.last_name,
      guest_id: guests.guest_id,
      room_number: rooms.room_number,
      room_type: rooms.room_type,
      check_in_date: bookings.check_in_date,
      check_out_date: bookings.check_out_date,
      nights: sql<number>`date_part('day', ${bookings.check_out_date} - ${bookings.check_in_date})`,
      status: bookings.status,
    })
    .from(bookings)
    .innerJoin(guests, eq(bookings.guest_id, guests.id))
    .innerJoin(rooms, eq(bookings.room_id, rooms.id))
    .orderBy(desc(bookings.created_at))
    .limit(limit);
  }

  // Payment methods
  async getPayments(page = 1, limit = 10, status?: string): Promise<Payment[]> {
    const offset = (page - 1) * limit;
    
    if (status) {
      return db.select()
        .from(payments)
        .where(eq(payments.status, status as any))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(payments.created_at));
    }
    
    return db.select()
      .from(payments)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(payments.created_at));
  }

  async getPaymentById(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentByPaymentId(paymentId: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.payment_id, paymentId));
    return payment;
  }

  async createPayment(payment: InsertPayment, paymentId: string): Promise<Payment> {
    const [newPayment] = await db.insert(payments)
      .values({ ...payment, payment_id: paymentId })
      .returning();
    return newPayment;
  }

  async updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [updatedPayment] = await db.update(payments)
      .set({ ...payment, updated_at: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  async deletePayment(id: number): Promise<boolean> {
    const result = await db.delete(payments).where(eq(payments.id, id)).returning();
    return result.length > 0;
  }

  async getPaymentsWithDetails(page = 1, limit = 10, status?: string): Promise<any[]> {
    const offset = (page - 1) * limit;
    
    const query = db.select({
      payment_id: payments.payment_id,
      id: payments.id,
      booking_id: bookings.booking_id,
      guest_first_name: guests.first_name,
      guest_last_name: guests.last_name,
      amount: payments.amount,
      payment_date: payments.payment_date,
      payment_method: payments.payment_method,
      status: payments.status,
      transaction_id: payments.transaction_id,
    })
    .from(payments)
    .innerJoin(bookings, eq(payments.booking_id, bookings.id))
    .innerJoin(guests, eq(bookings.guest_id, guests.id))
    .orderBy(desc(payments.created_at))
    .limit(limit)
    .offset(offset);
    
    if (status) {
      return await query.where(eq(payments.status, status as any));
    }
    
    return await query;
  }

  async getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    const query = db.select({
        total: sql<number>`sum(${payments.amount})`.as('total'),
      })
      .from(payments);
    
    if (startDate && endDate) {
      const result = await db
        .select({
          total: sql<number>`sum(${payments.amount})`.as('total'),
        })
        .from(payments)
        .where(
          and(
            gte(payments.payment_date, startDate),
            lte(payments.payment_date, endDate),
            eq(payments.status, 'paid')
          )
        );
      return result[0]?.total || 0;
    }
    
    const result = await query.where(eq(payments.status, 'paid'));
    return result[0]?.total || 0;
  }

  // Staff Activity methods
  async createStaffActivity(activity: InsertStaffActivity): Promise<StaffActivity> {
    const [newActivity] = await db.insert(staffActivities)
      .values(activity)
      .returning();
    return newActivity;
  }

  async getStaffActivities(limit = 5): Promise<any[]> {
    return db.select({
      id: staffActivities.id,
      staff_first_name: staff.first_name,
      staff_last_name: staff.last_name,
      activity_type: staffActivities.activity_type,
      description: staffActivities.description,
      created_at: staffActivities.created_at,
    })
    .from(staffActivities)
    .innerJoin(staff, eq(staffActivities.staff_id, staff.id))
    .orderBy(desc(staffActivities.created_at))
    .limit(limit);
  }

  // Statistics methods
  async getOccupancyRate(): Promise<number> {
    const [totalRooms] = await db
      .select({ count: sql<number>`count(*)` })
      .from(rooms)
      .where(eq(rooms.is_active, true));
    
    const [occupiedRooms] = await db
      .select({ count: sql<number>`count(*)` })
      .from(rooms)
      .where(
        and(
          eq(rooms.is_active, true),
          eq(rooms.status, 'occupied')
        )
      );
    
    if (totalRooms.count === 0) return 0;
    return (occupiedRooms.count / totalRooms.count) * 100;
  }

  async getRevenueByPeriod(period: string): Promise<any[]> {
    let groupBy: SQL;
    let dateFormat: string;
    
    switch (period) {
      case 'daily':
        groupBy = sql`date_trunc('day', ${payments.payment_date})`;
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'weekly':
        groupBy = sql`date_trunc('week', ${payments.payment_date})`;
        dateFormat = 'YYYY-WW';
        break;
      case 'monthly':
        groupBy = sql`date_trunc('month', ${payments.payment_date})`;
        dateFormat = 'YYYY-MM';
        break;
      default:
        groupBy = sql`date_trunc('month', ${payments.payment_date})`;
        dateFormat = 'YYYY-MM';
    }
    
    return db
      .select({
        period: sql<string>`to_char(${groupBy}, ${dateFormat})`,
        total: sql<number>`sum(${payments.amount})`,
      })
      .from(payments)
      .where(eq(payments.status, 'paid'))
      .groupBy(groupBy) // Utiliser le groupBy SQL défini plus haut au lieu de l'alias "period"
      .orderBy(groupBy);
  }

  async getTopRoomTypes(): Promise<any[]> {
    return db
      .select({
        room_type: rooms.room_type,
        count: sql<number>`count(*)`,
        percentage: sql<number>`count(*) * 100.0 / (select count(*) from ${bookings})`,
      })
      .from(bookings)
      .innerJoin(rooms, eq(bookings.room_id, rooms.id))
      .groupBy(rooms.room_type)
      .orderBy(desc(sql<number>`count(*)`));
  }
}

export const storage = new DatabaseStorage();
