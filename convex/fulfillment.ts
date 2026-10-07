import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./users";
import { logAudit } from "./auditLogs";

/** Shared argument validators for creating and updating a delivery zone. */
const deliveryZoneArgs = {
  name: v.string(),
  fee: v.number(), // Pesewas, integer >= 0
  estimatedDays: v.string(), // e.g. "1-2 business days"
  isActive: v.boolean(),
  sortOrder: v.number(),
};

/** Shared argument validators for creating and updating a pickup location. */
const pickupLocationArgs = {
  name: v.string(),
  address: v.string(),
  phone: v.string(),
  openingHours: v.string(),
  isActive: v.boolean(),
  sortOrder: v.number(),
};

function requireNonEmpty(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  return trimmed;
}

function validateFee(fee: number): void {
  if (!Number.isInteger(fee) || fee < 0) {
    throw new Error("Delivery fee must be a whole number of pesewas and cannot be negative.");
  }
}

function validateSortOrder(sortOrder: number): void {
  if (!Number.isInteger(sortOrder)) {
    throw new Error("Sort order must be a whole number.");
  }
}

function bySortOrderThenName<T extends { sortOrder: number; name: string }>(a: T, b: T): number {
  return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);
}

/**
 * Public query: List active delivery zones ordered by sortOrder.
 */
export const listDeliveryZones = query({
  args: {},
  handler: async (ctx) => {
    const zones = await ctx.db
      .query("deliveryZones")
      .withIndex("by_active_and_sort", (q) => q.eq("isActive", true))
      .collect();

    return zones.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * Public query: List active pickup locations ordered by sortOrder.
 */
export const listPickupLocations = query({
  args: {},
  handler: async (ctx) => {
    const locations = await ctx.db
      .query("pickupLocations")
      .withIndex("by_active_and_sort", (q) => q.eq("isActive", true))
      .collect();

    return locations.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * Admin Query: List every delivery zone (including inactive) for the admin table.
 */
export const adminListDeliveryZones = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("deliveryZones"),
      _creationTime: v.number(),
      name: v.string(),
      fee: v.number(),
      estimatedDays: v.string(),
      isActive: v.boolean(),
      sortOrder: v.number(),
    })
  ),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const zones = await ctx.db.query("deliveryZones").collect();
    return zones.sort(bySortOrderThenName);
  },
});

/**
 * Admin Query: List every pickup location (including inactive) for the admin table.
 */
export const adminListPickupLocations = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("pickupLocations"),
      _creationTime: v.number(),
      name: v.string(),
      address: v.string(),
      phone: v.string(),
      openingHours: v.string(),
      isActive: v.boolean(),
      sortOrder: v.number(),
    })
  ),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const locations = await ctx.db.query("pickupLocations").collect();
    return locations.sort(bySortOrderThenName);
  },
});

/**
 * Admin Mutation: Create a delivery zone.
 */
export const createDeliveryZone = mutation({
  args: deliveryZoneArgs,
  returns: v.id("deliveryZones"),
  handler: async (ctx, args) => {
    const { user } = await requireAdmin(ctx);

    const name = requireNonEmpty(args.name, "Zone name");
    const estimatedDays = requireNonEmpty(args.estimatedDays, "Estimated delivery time");
    validateFee(args.fee);
    validateSortOrder(args.sortOrder);

    const zoneId = await ctx.db.insert("deliveryZones", {
      name,
      fee: args.fee,
      estimatedDays,
      isActive: args.isActive,
      sortOrder: args.sortOrder,
    });

    await logAudit(ctx, {
      userId: user._id,
      action: "create",
      resourceType: "delivery_zone",
      resourceId: zoneId,
      details: `Created delivery zone "${name}" (fee: GHS ${(args.fee / 100).toFixed(2)})`,
    });

    return zoneId;
  },
});

/**
 * Admin Mutation: Update a delivery zone.
 */
export const updateDeliveryZone = mutation({
  args: { id: v.id("deliveryZones"), ...deliveryZoneArgs },
  handler: async (ctx, args) => {
    const { user } = await requireAdmin(ctx);

    const zone = await ctx.db.get(args.id);
    if (!zone) throw new Error("Delivery zone not found.");

    const name = requireNonEmpty(args.name, "Zone name");
    const estimatedDays = requireNonEmpty(args.estimatedDays, "Estimated delivery time");
    validateFee(args.fee);
    validateSortOrder(args.sortOrder);

    const changes: string[] = [];
    if (zone.name !== name) changes.push(`name: "${zone.name}" → "${name}"`);
    if (zone.fee !== args.fee) changes.push(`fee: ${zone.fee} → ${args.fee}`);
    if (zone.isActive !== args.isActive) changes.push(`active: ${zone.isActive} → ${args.isActive}`);

    await ctx.db.patch(args.id, {
      name,
      fee: args.fee,
      estimatedDays,
      isActive: args.isActive,
      sortOrder: args.sortOrder,
    });

    if (changes.length > 0) {
      await logAudit(ctx, {
        userId: user._id,
        action: "update",
        resourceType: "delivery_zone",
        resourceId: args.id,
        details: `Updated delivery zone "${name}": ${changes.join(", ")}`,
        before: { name: zone.name, fee: zone.fee, isActive: zone.isActive },
        after: { name, fee: args.fee, isActive: args.isActive },
      });
    }
  },
});

/**
 * Admin Mutation: Delete a delivery zone, unless existing orders reference it —
 * then deactivate it instead so historical orders keep their snapshot.
 */
export const removeDeliveryZone = mutation({
  args: { id: v.id("deliveryZones") },
  returns: v.object({ deleted: v.boolean(), deactivated: v.boolean() }),
  handler: async (ctx, args) => {
    const { user } = await requireAdmin(ctx);

    const zone = await ctx.db.get(args.id);
    if (!zone) throw new Error("Delivery zone not found.");

    // orders.deliveryZoneId has no index, so the scan happens server-side.
    const referencedOrder = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("deliveryZoneId"), args.id))
      .first();

    if (referencedOrder) {
      await ctx.db.patch(args.id, { isActive: false });
      await logAudit(ctx, {
        userId: user._id,
        action: "update",
        resourceType: "delivery_zone",
        resourceId: args.id,
        details: `Deactivated delivery zone "${zone.name}" (referenced by orders)`,
      });
      return { deleted: false, deactivated: true };
    }

    await ctx.db.delete(args.id);
    await logAudit(ctx, {
      userId: user._id,
      action: "delete",
      resourceType: "delivery_zone",
      resourceId: args.id,
      details: `Deleted delivery zone "${zone.name}"`,
    });
    return { deleted: true, deactivated: false };
  },
});

/**
 * Admin Mutation: Activate or deactivate a delivery zone.
 */
export const toggleDeliveryZoneActive = mutation({
  args: { id: v.id("deliveryZones"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const { user } = await requireAdmin(ctx);

    const zone = await ctx.db.get(args.id);
    if (!zone) throw new Error("Delivery zone not found.");

    if (zone.isActive !== args.isActive) {
      await ctx.db.patch(args.id, { isActive: args.isActive });
      await logAudit(ctx, {
        userId: user._id,
        action: "update",
        resourceType: "delivery_zone",
        resourceId: args.id,
        details: `${args.isActive ? "Activated" : "Deactivated"} delivery zone "${zone.name}"`,
        before: { isActive: zone.isActive },
        after: { isActive: args.isActive },
      });
    }
  },
});

/**
 * Admin Mutation: Create a pickup location.
 */
export const createPickupLocation = mutation({
  args: pickupLocationArgs,
  returns: v.id("pickupLocations"),
  handler: async (ctx, args) => {
    const { user } = await requireAdmin(ctx);

    const name = requireNonEmpty(args.name, "Location name");
    const address = requireNonEmpty(args.address, "Address");
    const phone = requireNonEmpty(args.phone, "Phone number");
    const openingHours = requireNonEmpty(args.openingHours, "Opening hours");
    validateSortOrder(args.sortOrder);

    const locationId = await ctx.db.insert("pickupLocations", {
      name,
      address,
      phone,
      openingHours,
      isActive: args.isActive,
      sortOrder: args.sortOrder,
    });

    await logAudit(ctx, {
      userId: user._id,
      action: "create",
      resourceType: "pickup_location",
      resourceId: locationId,
      details: `Created pickup location "${name}"`,
    });

    return locationId;
  },
});

/**
 * Admin Mutation: Update a pickup location.
 */
export const updatePickupLocation = mutation({
  args: { id: v.id("pickupLocations"), ...pickupLocationArgs },
  handler: async (ctx, args) => {
    const { user } = await requireAdmin(ctx);

    const location = await ctx.db.get(args.id);
    if (!location) throw new Error("Pickup location not found.");

    const name = requireNonEmpty(args.name, "Location name");
    const address = requireNonEmpty(args.address, "Address");
    const phone = requireNonEmpty(args.phone, "Phone number");
    const openingHours = requireNonEmpty(args.openingHours, "Opening hours");
    validateSortOrder(args.sortOrder);

    const changes: string[] = [];
    if (location.name !== name) changes.push(`name: "${location.name}" → "${name}"`);
    if (location.address !== address) changes.push(`address changed`);
    if (location.isActive !== args.isActive) changes.push(`active: ${location.isActive} → ${args.isActive}`);

    await ctx.db.patch(args.id, {
      name,
      address,
      phone,
      openingHours,
      isActive: args.isActive,
      sortOrder: args.sortOrder,
    });

    if (changes.length > 0) {
      await logAudit(ctx, {
        userId: user._id,
        action: "update",
        resourceType: "pickup_location",
        resourceId: args.id,
        details: `Updated pickup location "${name}": ${changes.join(", ")}`,
        before: { name: location.name, isActive: location.isActive },
        after: { name, isActive: args.isActive },
      });
    }
  },
});

/**
 * Admin Mutation: Delete a pickup location, unless existing orders reference it —
 * then deactivate it instead so historical orders keep their snapshot.
 */
export const removePickupLocation = mutation({
  args: { id: v.id("pickupLocations") },
  returns: v.object({ deleted: v.boolean(), deactivated: v.boolean() }),
  handler: async (ctx, args) => {
    const { user } = await requireAdmin(ctx);

    const location = await ctx.db.get(args.id);
    if (!location) throw new Error("Pickup location not found.");

    // orders.pickupLocationId has no index, so the scan happens server-side.
    const referencedOrder = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("pickupLocationId"), args.id))
      .first();

    if (referencedOrder) {
      await ctx.db.patch(args.id, { isActive: false });
      await logAudit(ctx, {
        userId: user._id,
        action: "update",
        resourceType: "pickup_location",
        resourceId: args.id,
        details: `Deactivated pickup location "${location.name}" (referenced by orders)`,
      });
      return { deleted: false, deactivated: true };
    }

    await ctx.db.delete(args.id);
    await logAudit(ctx, {
      userId: user._id,
      action: "delete",
      resourceType: "pickup_location",
      resourceId: args.id,
      details: `Deleted pickup location "${location.name}"`,
    });
    return { deleted: true, deactivated: false };
  },
});

/**
 * Admin Mutation: Activate or deactivate a pickup location.
 */
export const togglePickupLocationActive = mutation({
  args: { id: v.id("pickupLocations"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const { user } = await requireAdmin(ctx);

    const location = await ctx.db.get(args.id);
    if (!location) throw new Error("Pickup location not found.");

    if (location.isActive !== args.isActive) {
      await ctx.db.patch(args.id, { isActive: args.isActive });
      await logAudit(ctx, {
        userId: user._id,
        action: "update",
        resourceType: "pickup_location",
        resourceId: args.id,
        details: `${args.isActive ? "Activated" : "Deactivated"} pickup location "${location.name}"`,
        before: { isActive: location.isActive },
        after: { isActive: args.isActive },
      });
    }
  },
});
