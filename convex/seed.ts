import { mutation } from "./_generated/server";
import { buildSearchText } from "./lib/searchText";

/**
 * Seed initial sample categories, products, delivery zones, pickup locations, and site settings.
 * Safe to run multiple times: only inserts if tables are empty.
 */
export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const existingCats = await ctx.db.query("categories").first();
    if (existingCats) {
      return { message: "Database already populated. Skipping seed." };
    }

    const now = Date.now();

    // 1. Insert Categories
    const catChairsId = await ctx.db.insert("categories", {
      name: "Ergonomic Chairs",
      slug: "ergonomic-chairs",
      description: "High-adjustability breathable mesh and executive seating designed for all-day comfort.",
      sortOrder: 1,
      isActive: true,
      specTemplate: ["Mechanism", "Armrests", "Lumbar Support", "Weight Capacity", "Material"],
    });

    const catDesksId = await ctx.db.insert("categories", {
      name: "Standing Desks",
      slug: "standing-desks",
      description: "Dual-motor motorized height adjustable sit-stand desks with anti-collision and memory presets.",
      sortOrder: 2,
      isActive: true,
      specTemplate: ["Motor Type", "Height Range", "Weight Capacity", "Tabletop Material", "Warranty"],
    });

    const catKeyboardsId = await ctx.db.insert("categories", {
      name: "Keyboards & Mice",
      slug: "keyboards-and-mice",
      description: "Mechanical keyboards, ergonomic vertical mice, and productivity wireless peripherals.",
      sortOrder: 3,
      isActive: true,
      specTemplate: ["Connectivity", "Switch Type", "Battery Life", "Layout", "Compatibility"],
    });

    const catMonitorsId = await ctx.db.insert("categories", {
      name: "Monitors & Docks",
      slug: "monitors-and-docks",
      description: "USB-C docking stations, monitor arms, and color-accurate displays for dual-screen productivity.",
      sortOrder: 4,
      isActive: true,
      specTemplate: ["Ports", "Power Delivery", "Resolution Support", "Mount Type", "Cable Length"],
    });

    const catStorageId = await ctx.db.insert("categories", {
      name: "Hardware & Storage",
      slug: "hardware-and-storage",
      description: "NVMe SSDs, external backup drives, RAM modules, and cooling accessories.",
      sortOrder: 5,
      isActive: true,
      specTemplate: ["Capacity", "Read Speed", "Write Speed", "Interface", "Form Factor"],
    });

    // 2. Insert Products
    const demoProducts = [
      {
        name: "ErgoPro High-Back Mesh Ergonomic Office Chair",
        slug: "ergopro-high-back-mesh-chair",
        description:
          "Professional-grade ergonomic office chair featuring dynamic lumbar support, 3D adjustable armrests, 135-degree recline mechanism, and breathable Korean mesh. Engineered for 10+ hours daily desk productivity.",
        categoryId: catChairsId,
        categoryName: "Ergonomic Chairs",
        brand: "ErgoPro",
        sku: "EP-HBM-01",
        price: 320000, // GHS 3,200.00
        salePrice: 285000, // GHS 2,850.00
        stock: 14,
        reservedStock: 0,
        imageIds: [],
        specs: [
          { group: "Ergonomics", label: "Lumbar Support", value: "Self-adjusting adaptive lumbar" },
          { group: "Ergonomics", label: "Armrests", value: "3D height, angle, and depth adjustable" },
          { group: "Build", label: "Base & Castors", value: "Polished aluminum alloy with 60mm PU silent castors" },
          { group: "Build", label: "Max Weight", value: "150 kg (330 lbs)" },
          { group: "Warranty", label: "Coverage", value: "3 Years frame and gas cylinder warranty" },
        ],
        isActive: true,
        isFeatured: true,
      },
      {
        name: "Apex Dual-Motor Electric Standing Desk (140x70cm Walnut)",
        slug: "apex-dual-motor-electric-standing-desk",
        description:
          "Heavy-duty dual-motor motorized standing desk frame with a premium solid-core walnut tabletop. 4 memory height presets, anti-collision sensor, and integrated cable management channel.",
        categoryId: catDesksId,
        categoryName: "Standing Desks",
        brand: "ApexDesk",
        sku: "APX-SD-140W",
        price: 450000, // GHS 4,500.00
        salePrice: 420000, // GHS 4,200.00
        stock: 8,
        reservedStock: 0,
        imageIds: [],
        specs: [
          { group: "Mechanism", label: "Motors", value: "Dual synchronized electric motors" },
          { group: "Mechanism", label: "Height Range", value: "62cm - 128cm (smooth 35mm/s speed)" },
          { group: "Controller", label: "Presets", value: "LED digital display with 4 memory slots" },
          { group: "Weight", label: "Lift Capacity", value: "125 kg static/dynamic load" },
          { group: "Tabletop", label: "Dimensions", value: "140cm x 70cm x 2.5cm Walnut finished bevel" },
        ],
        isActive: true,
        isFeatured: true,
      },
      {
        name: "Logitech MX Master 3S Wireless Performance Mouse",
        slug: "logitech-mx-master-3s-mouse",
        description:
          "The industry standard productivity mouse. 8,000 DPI track-on-glass optical sensor, Quiet Clicks technology, MagSpeed electromagnetic scroll wheel, and Multi-Device Flow connectivity.",
        categoryId: catKeyboardsId,
        categoryName: "Keyboards & Mice",
        brand: "Logitech",
        sku: "LOG-MXM3S-GR",
        price: 135000, // GHS 1,350.00
        salePrice: 125000, // GHS 1,250.00
        stock: 22,
        reservedStock: 0,
        imageIds: [],
        specs: [
          { group: "Sensor", label: "DPI Range", value: "200 to 8000 DPI (50 DPI increments)" },
          { group: "Connectivity", label: "Wireless", value: "Bluetooth Low Energy & Logi Bolt USB Receiver" },
          { group: "Battery", label: "Life", value: "Up to 70 days on full charge (USB-C quick charge)" },
          { group: "Compatibility", label: "OS Support", value: "Windows 10/11, macOS, Linux, iPadOS" },
        ],
        isActive: true,
        isFeatured: true,
      },
      {
        name: "Keychron Q3 Max QMK/VIA Wireless Custom Mechanical Keyboard",
        slug: "keychron-q3-max-mechanical-keyboard",
        description:
          "Tenkeyless (80%) full CNC aluminum body mechanical keyboard with acoustic foam padding, double-gasket mount design, 2.4GHz wireless & Bluetooth, Gateron Jupiter Bananas switches, and PBT keycaps.",
        categoryId: catKeyboardsId,
        categoryName: "Keyboards & Mice",
        brand: "Keychron",
        sku: "KC-Q3M-TKL",
        price: 260000, // GHS 2,600.00
        stock: 10,
        reservedStock: 0,
        imageIds: [],
        specs: [
          { group: "Body", label: "Material", value: "6063 Full CNC machined aluminum chassis" },
          { group: "Switches", label: "Type", value: "Hot-swappable Gateron Jupiter Banana (Tactile)" },
          { group: "Connectivity", label: "Modes", value: "2.4 GHz, Bluetooth 5.1, and Type-C Wired" },
          { group: "Firmware", label: "Customization", value: "QMK/VIA open-source key remapping" },
        ],
        isActive: true,
        isFeatured: true,
      },
      {
        name: "CalDigit TS4 Thunderbolt 4 18-Port Docking Station",
        slug: "caldigit-ts4-thunderbolt-4-dock",
        description:
          "The most powerful 18-port Thunderbolt 4 workstation hub with 98W host charging, 2.5GbE Ethernet, UHS-II SD/microSD readers, DisplayPort 1.4, and 8 USB ports.",
        categoryId: catMonitorsId,
        categoryName: "Monitors & Docks",
        brand: "CalDigit",
        sku: "CD-TS4-18P",
        price: 490000, // GHS 4,900.00
        salePrice: 465000, // GHS 4,650.00
        stock: 6,
        reservedStock: 0,
        imageIds: [],
        specs: [
          { group: "Power", label: "Host Delivery", value: "98W Power Delivery to Laptop" },
          { group: "Ports", label: "Total I/O", value: "18 Ports (3x TB4, 5x USB-A, 3x USB-C, 1x DP 1.4)" },
          { group: "Networking", label: "Ethernet", value: "2.5 Gigabit Ethernet RJ-45" },
          { group: "Display", label: "Support", value: "Single 8K @ 60Hz or Dual 4K @ 60Hz displays" },
        ],
        isActive: true,
        isFeatured: true,
      },
      {
        name: "Samsung 990 PRO 2TB PCIe Gen4 NVMe M.2 SSD",
        slug: "samsung-990-pro-2tb-nvme-ssd",
        description:
          "Flagship PCIe 4.0 internal solid-state drive delivering sequential read speeds up to 7,450 MB/s and write speeds up to 6,900 MB/s for workstations and gaming systems.",
        categoryId: catStorageId,
        categoryName: "Hardware & Storage",
        brand: "Samsung",
        sku: "SAM-990P-2TB",
        price: 245000, // GHS 2,450.00
        stock: 18,
        reservedStock: 0,
        imageIds: [],
        specs: [
          { group: "Performance", label: "Read Speed", value: "Up to 7,450 MB/s Sequential Read" },
          { group: "Performance", label: "Write Speed", value: "Up to 6,900 MB/s Sequential Write" },
          { group: "Interface", label: "Bus", value: "PCIe Gen 4.0 x4, NVMe 2.0" },
          { group: "Endurance", label: "TBW", value: "1200 TBW with 5-Year Limited Warranty" },
        ],
        isActive: true,
        isFeatured: false,
      },
    ];

    for (const prod of demoProducts) {
      const { categoryName, salePrice, ...rest } = prod;
      const searchText = buildSearchText(rest, categoryName);
      await ctx.db.insert("products", {
        ...rest,
        ...(salePrice ? { salePrice } : {}),
        searchText,
        createdAt: now,
        updatedAt: now,
      });
    }

    // 3. Insert Delivery Zones
    await ctx.db.insert("deliveryZones", {
      name: "Accra Central & Surroundings",
      fee: 3500, // GHS 35.00
      estimatedDays: "Same day / 24 hours",
      isActive: true,
      sortOrder: 1,
    });
    await ctx.db.insert("deliveryZones", {
      name: "Greater Accra (Tema, Kasoa, Adenta)",
      fee: 5000, // GHS 50.00
      estimatedDays: "1 - 2 business days",
      isActive: true,
      sortOrder: 2,
    });
    await ctx.db.insert("deliveryZones", {
      name: "Other Regions (Kumasi, Takoradi, Tamale)",
      fee: 8000, // GHS 80.00
      estimatedDays: "2 - 3 business days via VIP/OA Express",
      isActive: true,
      sortOrder: 3,
    });

    // 4. Insert Pickup Locations
    await ctx.db.insert("pickupLocations", {
      name: "MB Ventures Main Store",
      address: "Circle Commercial District, Accra, Ghana",
      phone: "+233 24 000 0000",
      openingHours: "Mon - Sat: 8:00 AM - 6:00 PM",
      isActive: true,
      sortOrder: 1,
    });

    // 5. Insert Site Settings
    await ctx.db.insert("siteSettings", {
      shopName: "MB Ventures GH",
      tagline: "Premium Computer Accessories, Hardware & Ergonomic Office Furniture",
      currency: "GHS",
      defaultCountryCode: "GH",
      contactEmail: "orders@mbventuresgh.com",
      contactPhone: "+233 24 000 0000",
      whatsappNumber: "+233 24 000 0000",
      address: "Circle Commercial Area, Accra, Ghana",
      announcement: {
        enabled: true,
        text: "Fast delivery across Accra & nationwide shipping available. Cash on delivery & MoMo accepted.",
        link: "/catalog",
      },
      hero: {
        title: "Computer accessories, hardware, and ergonomic workspace furniture.",
        subtitle:
          "Specialist equipment for productive setups. High performance hardware, mechanical keyboards, ergonomic seating, and motorized standing desks in stock for immediate delivery or pickup in Accra.",
        buttonText: "Shop workspace gear",
        buttonLink: "/catalog",
      },
      promoTiles: [
        {
          title: "Ergonomic Seating",
          subtitle: "Mesh and high-back chairs engineered for 10+ hour comfort",
          link: "/category/ergonomic-chairs",
        },
        {
          title: "Motorized Standing Desks",
          subtitle: "Dual-motor solid walnut and oak sit-stand workstations",
          link: "/category/standing-desks",
        },
      ],
      momoAccounts: [
        {
          network: "MTN",
          number: "0240000000",
          name: "MB VENTURES GH",
        },
        {
          network: "Telecel",
          number: "0200000000",
          name: "MB VENTURES GH",
        },
      ],
      cashOnDeliveryEnabled: true,
      payInStoreEnabled: true,
      freeDeliveryThreshold: 500000, // Free delivery above GHS 5,000
      orderExpiryMinutes: 30,
      lowStockThreshold: 3,
      maxCartQuantity: 10,
      pricesIncludeTaxNote: "All prices inclusive of taxes",
      socialLinks: {
        whatsapp: "https://wa.me/233240000000",
      },
    });

    return { message: "Database seeded successfully with initial products, categories, zones, and settings." };
  },
});
