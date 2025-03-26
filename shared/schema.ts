import { pgEnum, pgTable, serial, text, date, boolean, timestamp, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roomStatusEnum = pgEnum('room_status', ['vacant', 'occupied', 'maintenance', 'cleaning', 'booked']);
export const roomTypeEnum = pgEnum('room_type', ['standard', 'deluxe', 'suite']);
export const bookingStatusEnum = pgEnum('booking_status', ['confirmed', 'pending', 'cancelled', 'checked_in', 'checked_out']);
export const paymentStatusEnum = pgEnum('payment_status', ['paid', 'pending', 'refunded', 'cancelled']);
export const paymentMethodEnum = pgEnum('payment_method', ['credit_card', 'debit_card', 'cash', 'bank_transfer', 'online']);

// Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  guest_id: text("guest_id").notNull().unique(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  postal_code: text("postal_code"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  room_number: text("room_number").notNull().unique(),
  room_type: roomTypeEnum("room_type").notNull(),
  status: roomStatusEnum("status").notNull(),
  capacity_adults: integer("capacity_adults").notNull(),
  capacity_children: integer("capacity_children").notNull(),
  price_per_night: decimal("price_per_night", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Continuez avec les autres tables (staff, bookings, payments, etc.)

// Schémas pour l'insertion
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;