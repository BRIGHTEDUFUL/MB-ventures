import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { buildSearchText } from "./lib/searchText";

/**
 * Add the Black Carbon Fiber Gaming Desk product
 * Run with: npx convex run addGamingDesk:createGamingDesk
 */
export const createGamingDesk = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Find the Standing Desks category
    const category = await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("slug"), "standing-desks"))
      .first();

    if (!category) {
      throw new Error("Standing Desks category not found. Please create it first or run seed data.");
    }

    // Check if product already exists
    const existing = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("sku"), "DESK-ESPORT-CF-140"))
      .first();

    if (existing) {
      return {
        success: false,
        message: "Product already exists",
        productId: existing._id,
      };
    }

    const now = Date.now();

    const productData = {
      name: "Black Carbon Fiber E-Sports Gaming Desk 140x60cm",
      slug: "black-carbon-fiber-esports-gaming-desk-140x60",
      description: `Professional e-sports gaming desk featuring a premium black carbon fiber texture tabletop designed for competitive gaming and extended work sessions. Spacious 140x60cm surface provides ample room for multiple monitors, gaming peripherals, and accessories.

Built with ergonomic design principles for optimal comfort during marathon gaming sessions or intensive work periods. The carbon fiber textured surface is durable, scratch-resistant, and easy to clean, while the sturdy frame supports heavy gaming setups with stability.

Perfect for gamers, streamers, content creators, and professionals who demand both style and functionality from their workspace. The sleek black finish complements any gaming setup or modern office environment.`,
      categoryId: category._id,
      brand: "MB Ventures",
      sku: "DESK-ESPORT-CF-140",
      price: 175000, // GHC 1,750.00
      salePrice: 145000, // GHC 1,450.00
      stock: 5,
      reservedStock: 0,
      imageIds: [], // Will be empty for now - upload via admin panel
      specs: [
        { group: "Dimensions", label: "Desktop Size", value: "140cm (W) x 60cm (D) x 75cm (H)" },
        { group: "Dimensions", label: "Thickness", value: "Standard desktop thickness" },
        { group: "Surface", label: "Material", value: "Carbon Fiber Texture Finish" },
        { group: "Surface", label: "Color", value: "Matte Black" },
        { group: "Surface", label: "Features", value: "Scratch-resistant, water-resistant, easy-clean" },
        { group: "Build", label: "Frame Material", value: "Heavy-duty steel frame" },
        { group: "Build", label: "Weight Capacity", value: "Up to 80kg load bearing" },
        { group: "Build", label: "Stability", value: "Anti-wobble leg design with adjustable feet" },
        { group: "Ergonomics", label: "Height", value: "Fixed 75cm optimal gaming height" },
        { group: "Ergonomics", label: "Design", value: "Ergonomic curved edge for wrist comfort" },
        { group: "Features", label: "Cable Management", value: "Built-in cable routing system" },
        { group: "Features", label: "Assembly", value: "Easy assembly with included tools and instructions" },
        { group: "Use Case", label: "Ideal For", value: "Gaming, streaming, office work, content creation" },
      ],
      isActive: true,
      isFeatured: true,
      createdAt: now,
      updatedAt: now,
    };

    // Build search text
    const searchText = buildSearchText(productData, category.name);

    // Insert product
    const productId = await ctx.db.insert("products", {
      ...productData,
      searchText,
    });

    // Create initial stock adjustment record
    await ctx.db.insert("stockAdjustments", {
      productId,
      delta: 5,
      reason: "restock",
      note: "Initial stock for Black Carbon Fiber Gaming Desk",
      actorId: "system",
      createdAt: now,
    });

    return {
      success: true,
      message: "Gaming desk product created successfully!",
      productId,
      product: {
        name: productData.name,
        sku: productData.sku,
        price: `GHC ${(productData.price / 100).toFixed(2)}`,
        salePrice: `GHC ${(productData.salePrice / 100).toFixed(2)}`,
        savings: `GHC ${((productData.price - productData.salePrice) / 100).toFixed(2)}`,
        stock: productData.stock,
        category: category.name,
      },
    };
  },
});
