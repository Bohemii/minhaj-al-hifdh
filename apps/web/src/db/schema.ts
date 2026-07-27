import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  numeric,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  locale: text("locale").default("ar"),
  tz: text("tz").default("Asia/Riyadh"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ayahStatus = pgTable(
  "ayah_status",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id),
    ayahId: integer("ayah_id").notNull(),
    state: text("state").notNull().default("new"),
    box: integer("box").default(0),
    dueDate: date("due_date"),
    lastReviewedAt: timestamp("last_reviewed_at"),
    memorizedAt: timestamp("memorized_at"),
  },
  (t) => [unique().on(t.userId, t.ayahId)]
);

export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => profiles.id),
  mode: text("mode"),
  startDate: date("start_date"),
  targetDate: date("target_date"),
  pagesPerDay: numeric("pages_per_day"),
  restEvery: integer("rest_every"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => profiles.id),
  date: date("date").notNull(),
  fromAyah: integer("from_ayah"),
  toAyah: integer("to_ayah"),
  listens: integer("listens").default(0),
  repeats: integer("repeats").default(0),
  recites: integer("recites").default(0),
  prayed: boolean("prayed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
