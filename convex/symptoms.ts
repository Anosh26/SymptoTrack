import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const logSymptom = mutation({
  // 1. Update the argument to match the schema (userId points to "users" table)
  args: { 
    userId: v.id("users"), 
    description: v.string(), 
    severity: v.number() 
  },
  handler: async (ctx, args) => {
    // 2. Insert into the valid "symptoms" table
    await ctx.db.insert("symptoms", {
      userId: args.userId,
      description: args.description,
      severity: args.severity,
      timestamp: Date.now(),
    });
  },
});

export const getSymptoms = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("symptoms")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc") // Show newest first
      .collect();
  },
});