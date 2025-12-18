import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a new patient (Note: We are writing to the 'users' table now)
export const createPatient = mutation({
  args: { 
    name: v.string(), 
    email: v.string(),
    phone: v.optional(v.string()) 
  },
  handler: async (ctx, args) => {
    // We insert into "users" instead of "patients"
    const newUserId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      phoneNumber: args.phone,
      // We automatically set the role to "patient" here
      role: "patient", 
    });
    return newUserId;
  },
});

// Get only the users who are patients
export const getPatients = query({
  args: {},
  handler: async (ctx) => {
    // We search the 'users' table and filter where role is 'patient'
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "patient"))
      .collect();
  },
});

export const getAnyPatient = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").order("desc").first();
  },
});