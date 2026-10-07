import { v } from "convex/values";
import { query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * Helper function to create audit log entries for admin actions.
 * 
 * Call this function after any significant admin action (create, update, delete)
 * to maintain a comprehensive audit trail.
 * 
 * @param ctx - Mutation context
 * @param params - Audit log parameters
 * @param params.userId - ID of the user performing the action
 * @param params.action - Action performed (e.g., "create", "update", "delete")
 * @param params.resourceType - Type of resource (e.g., "product", "order", "user")
 * @param params.resourceId - ID of the affected resource (optional)
 * @param params.details - Human-readable description of what changed
 * @param params.before - Optional snapshot of data before the change (for logging purposes only, not persisted)
 * @param params.after - Optional snapshot of data after the change (for logging purposes only, not persisted)
 */
export async function logAudit(
  ctx: MutationCtx,
  params: {
    userId: Id<"users">;
    action: string;
    resourceType: string;
    resourceId?: string;
    details?: string;
    before?: Record<string, any>;
    after?: Record<string, any>;
  }
) {
  // Build a comprehensive summary message
  let summary = params.details || `${params.action} ${params.resourceType}`;
  
  // Append before/after info if provided (for context in the summary)
  if (params.before && params.after) {
    const changes = Object.keys(params.after).map(key => {
      const afterValue = params.after?.[key];
      if (JSON.stringify(params.before?.[key]) !== JSON.stringify(afterValue)) {
        return `${key}: ${JSON.stringify(params.before?.[key])} → ${JSON.stringify(afterValue)}`;
      }
      return null;
    }).filter(Boolean);
    if (changes.length > 0 && summary === `${params.action} ${params.resourceType}`) {
      summary += ` (${changes.join(", ")})`;
    }
  }

  await ctx.db.insert("auditLogs", {
    actorId: String(params.userId),
    action: params.action,
    entityType: params.resourceType,
    entityId: params.resourceId || "",
    summary,
    createdAt: Date.now(),
  });
}

/**
 * Admin Query: List recent audit logs with pagination and optional filters.
 */
export const list = query({
  args: {
    limit: v.optional(v.number()),
    actorId: v.optional(v.string()),
    entityType: v.optional(v.string()),
    action: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 50, 200);

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_created")
      .order("desc")
      .take(limit);

    // Filter in memory if filters are provided
    let filtered = logs;
    if (args.actorId) {
      filtered = filtered.filter((log) => log.actorId === args.actorId);
    }
    if (args.entityType) {
      filtered = filtered.filter((log) => log.entityType === args.entityType);
    }
    if (args.action) {
      filtered = filtered.filter((log) => log.action === args.action);
    }

    // Enrich with user details
    const enriched = await Promise.all(
      filtered.map(async (log) => {
        let userName = "System";
        let userEmail: string | undefined = undefined;

        if (log.actorId) {
          try {
            const user = await ctx.db.get(log.actorId as Id<"users">);
            if (user) {
              userName = user.name || user.email || "Unknown User";
              userEmail = user.email;
            }
          } catch {
            userName = "Unknown User";
          }
        }

        return {
          _id: log._id,
          _creationTime: log._creationTime,
          actorId: log.actorId,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          summary: log.summary,
          createdAt: log.createdAt,
          userName,
          userEmail,
        };
      })
    );

    return enriched;
  },
});

/**
 * Admin Query: Get audit logs for a specific resource.
 */
export const getForResource = query({
  args: {
    entityType: v.string(),
    entityId: v.string(),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_entity", (q) =>
        q.eq("entityType", args.entityType).eq("entityId", args.entityId)
      )
      .order("desc")
      .take(100);

    // Enrich with user details
    const enriched = await Promise.all(
      logs.map(async (log) => {
        let userName = "System";
        let userEmail: string | undefined = undefined;

        if (log.actorId) {
          try {
            const user = await ctx.db.get(log.actorId as Id<"users">);
            if (user) {
              userName = user.name || user.email || "Unknown User";
              userEmail = user.email;
            }
          } catch {
            userName = "Unknown User";
          }
        }

        return {
          _id: log._id,
          _creationTime: log._creationTime,
          actorId: log.actorId,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          summary: log.summary,
          createdAt: log.createdAt,
          userName,
          userEmail,
        };
      })
    );

    return enriched;
  },
});

/**
 * Admin Query: Get recent activity summary (last 24 hours).
 */
export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_created")
      .order("desc")
      .take(200);

    // Filter to last 24 hours
    const recent = logs.filter((log) => log.createdAt >= oneDayAgo).slice(0, 50);

    // Enrich with user details
    const enriched = await Promise.all(
      recent.map(async (log) => {
        let userName = "System";
        let userEmail: string | undefined = undefined;

        if (log.actorId) {
          try {
            const user = await ctx.db.get(log.actorId as Id<"users">);
            if (user) {
              userName = user.name || user.email || "Unknown User";
              userEmail = user.email;
            }
          } catch {
            userName = "Unknown User";
          }
        }

        return {
          _id: log._id,
          _creationTime: log._creationTime,
          actorId: log.actorId,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          summary: log.summary,
          createdAt: log.createdAt,
          userName,
          userEmail,
        };
      })
    );

    return enriched;
  },
});
