import { internalMutation } from "./_generated/server";
import { buildSearchText } from "./lib/searchText";

/**
 * Set up the store with real data (no demo products)
 * - Creates essential categories
 * - Creates real delivery zones for Ghana
 * - Creates pickup location
 * - Adds the gaming desk product
 * 
 * Run with: npx convex run setupRealStore:setup
 */
export const setup = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    console.log("Setting up real store...");

    // 1. Create Categories
    console.log("Creating categories...");
    
    const catDesksId = await ctx.db.insert("categories", {
      name: "Gaming & Office Desks",
      slug: "gaming-office-desks",
      description: "Professional gaming desks, standing desks, and office workstations for productivity and comfort.",
      sortOrder: 1,
      isActive: true,
      specTemplate: ["Dimensions", "Material", "Weight Capacity", "Features", "Assembly"],
    });

    const catChairsId = await ctx.db.insert("categories", {
      name: "Office Chairs",
      slug: "office-chairs",
      description: "Ergonomic office chairs and gaming chairs for all-day comfort.",
      sortOrder: 2,
      isActive: true,
      specTemplate: ["Mechanism", "Armrests", "Lumbar Support", "Weight Capacity", "Material"],
    });

    const catAccessoriesId = await ctx.db.insert("categories", {
      name: "Computer Accessories",
      slug: "computer-accessories",
      description: "Keyboards, mice, monitors, and essential computer peripherals.",
      sortOrder: 3,
      isActive: true,
      specTemplate: ["Connectivity", "Compatibility", "Features", "Warranty"],
    });

    console.log("Categories created!");

    // 2. Create Delivery Zones (Real Ghana locations)
    console.log("Creating delivery zones...");

    await ctx.db.insert("deliveryZones", {
      name: "Accra Central & Circle",
      fee: 3000, // GHC 30.00
      estimatedDays: "Same day or next day",
      isActive: true,
      sortOrder: 1,
    });

    await ctx.db.insert("deliveryZones", {
      name: "Greater Accra (Tema, Kasoa, Adenta, Teshie)",
      fee: 5000, // GHC 50.00
      estimatedDays: "1-2 business days",
      isActive: true,
      sortOrder: 2,
    });

    await ctx.db.insert("deliveryZones", {
      name: "Other Regions (Kumasi, Takoradi, Cape Coast, Tamale)",
      fee: 10000, // GHC 100.00
      estimatedDays: "2-4 business days",
      isActive: true,
      sortOrder: 3,
    });

    console.log("Delivery zones created!");

    // 3. Create Pickup Location (Update with your real address)
    console.log("Creating pickup location...");

    await ctx.db.insert("pickupLocations", {
      name: "MB Ventures GH - Main Store",
      address: "Circle Commercial Area, Accra, Ghana", // Update this
      phone: "+233 24 000 0000", // Update this
      openingHours: "Monday - Saturday: 8:00 AM - 6:00 PM",
      isActive: true,
      sortOrder: 1,
    });

    console.log("Pickup location created!");

    // 4. Create the Gaming Desk Product
    console.log("Creating gaming desk product...");

    const productData = {
      name: "Black Carbon Fiber E-Sports Gaming Desk 140x60cm",
      slug: "black-carbon-fiber-esports-gaming-desk-140x60",
      description: `Professional e-sports gaming desk featuring a premium black carbon fiber texture tabletop designed for competitive gaming and extended work sessions. Spacious 140x60cm surface provides ample room for multiple monitors, gaming peripherals, and accessories.

Built with ergonomic design principles for optimal comfort during marathon gaming sessions or intensive work periods. The carbon fiber textured surface is durable, scratch-resistant, and easy to clean, while the sturdy frame supports heavy gaming setups with stability.

Perfect for gamers, streamers, content creators, and professionals who demand both style and functionality from their workspace. The sleek black finish complements any gaming setup or modern office environment.`,
      categoryId: catDesksId,
      brand: "MB Ventures",
      sku: "DESK-ESPORT-CF-140",
      price: 175000, // GHC 1,750.00
      salePrice: 145000, // GHC 1,450.00
      stock: 5,
      reservedStock: 0,
      imageIds: [],
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

    const category = await ctx.db.get(catDesksId);
    const searchText = buildSearchText(productData, category!.name);

    const productId = await ctx.db.insert("products", {
      ...productData,
      searchText,
    });

    // Create stock adjustment
    await ctx.db.insert("stockAdjustments", {
      productId,
      delta: 5,
      reason: "restock",
      note: "Initial stock for Black Carbon Fiber Gaming Desk",
      actorId: "system",
      createdAt: now,
    });

    console.log("Gaming desk created!");

    console.log("Real store setup completed successfully!");

    return {
      success: true,
      message: "Store setup complete with real data",
      summary: {
        categories: 3,
        deliveryZones: 3,
        pickupLocations: 1,
        products: 1,
        gamingDesk: {
          id: productId,
          name: productData.name,
          sku: productData.sku,
          price: `GHC ${(productData.price / 100).toFixed(2)}`,
          salePrice: `GHC ${(productData.salePrice / 100).toFixed(2)}`,
          savings: `GHC ${((productData.price - productData.salePrice) / 100).toFixed(2)}`,
        },
      },
    };
  },
});
