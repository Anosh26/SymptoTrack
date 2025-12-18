import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("patient"), v.literal("doctor"), v.literal("caregiver")),
    phoneNumber: v.optional(v.string()), 
  }),

  // ... (keep dailyVitals, medications, etc. as they were) ...

  // ADD THIS NEW TABLE:
  symptoms: defineTable({
    userId: v.id("users"), // Note: We link to 'users', not 'patients'
    description: v.string(),
    severity: v.number(),
    timestamp: v.number(),
  }),
});