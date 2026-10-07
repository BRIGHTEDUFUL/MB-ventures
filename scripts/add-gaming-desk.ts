/**
 * Script to add the Black Carbon Fiber Gaming Desk product
 * 
 * This demonstrates the proper way to add a real product with:
 * - Professional product description
 * - Proper pricing (in pesewas)
 * - Detailed specifications
 * - Category assignment
 * 
 * To add the product, you'll need to:
 * 1. Upload the image via Admin > Products > New Product
 * 2. Use this data as reference for filling the form
 */

export const gamingDeskProduct = {
  name: "Black Carbon Fiber E-Sports Gaming Desk 140x60cm",
  sku: "DESK-ESPORT-CF-140",
  brand: "MB Ventures",
  
  // Category: Use "Standing Desks" or create "Gaming Desks"
  categorySlug: "standing-desks",
  
  // Pricing in pesewas (GHC 1,450.00 sale price, GHC 1,750.00 regular)
  price: 175000,      // GHC 1,750.00
  salePrice: 145000,  // GHC 1,450.00
  
  // Stock - update with actual inventory
  stock: 5,
  
  // Professional product description
  description: `Professional e-sports gaming desk featuring a premium black carbon fiber texture tabletop designed for competitive gaming and extended work sessions. Spacious 140x60cm surface provides ample room for multiple monitors, gaming peripherals, and accessories.

Built with ergonomic design principles for optimal comfort during marathon gaming sessions or intensive work periods. The carbon fiber textured surface is durable, scratch-resistant, and easy to clean, while the sturdy frame supports heavy gaming setups with stability.

Perfect for gamers, streamers, content creators, and professionals who demand both style and functionality from their workspace. The sleek black finish complements any gaming setup or modern office environment.`,

  // Detailed specifications
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

  // Product features (for bullets)
  features: [
    "Premium black carbon fiber texture surface",
    "Spacious 140x60cm desktop for multi-monitor setups",
    "Ergonomic 75cm height optimized for gaming chairs",
    "Heavy-duty steel frame supports up to 80kg",
    "Scratch and water-resistant coating",
    "Integrated cable management system",
    "Anti-wobble adjustable leg levelers",
    "Easy assembly with all hardware included",
  ],

  // Status
  isActive: true,
  isFeatured: true, // Feature this on homepage as it's a new product

  // Image
  imagePath: "public/products/gaming-desk-carbon-fiber.jpeg",
  
  // SEO-friendly slug
  slug: "black-carbon-fiber-esports-gaming-desk-140x60",
};

console.log(`
╔════════════════════════════════════════════════════════════════╗
║              GAMING DESK PRODUCT DATA                          ║
║                                                                ║
║  Product: ${gamingDeskProduct.name.substring(0, 47)}           ║
║  Regular Price: GHC ${(gamingDeskProduct.price / 100).toFixed(2)}                              ║
║  Sale Price: GHC ${(gamingDeskProduct.salePrice / 100).toFixed(2)}                              ║
║  Savings: GHC ${((gamingDeskProduct.price - gamingDeskProduct.salePrice) / 100).toFixed(2)}                                       ║
║                                                                ║
║  To add this product:                                          ║
║  1. Go to http://localhost:3000/admin/products/new             ║
║  2. Upload image: public/products/gaming-desk-carbon-fiber.jpeg║
║  3. Copy data from scripts/add-gaming-desk.ts                  ║
║  4. Fill in the form fields                                    ║
║  5. Click "Create Product"                                     ║
╚════════════════════════════════════════════════════════════════╝
`);

export {};
