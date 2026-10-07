# Adding Real Products to MB Ventures GH

This guide explains how to add real products after clearing mock data.

## Step 1: Clear Mock Data

Run this command to remove all demo products, categories, and related data:

```bash
npx convex run clearMockData:clearAllMockData
```

**What gets deleted:**
- ✓ All demo products (6 sample products)
- ✓ All categories (5 sample categories)
- ✓ All orders and cart items
- ✓ All delivery zones and pickup locations
- ✓ All contact messages and custom pages
- ✓ All stock adjustments and saved addresses

**What stays:**
- ✓ User accounts (admin and customers)
- ✓ Audit logs (admin action history)
- ✓ Email logs (email history)
- ✓ Site settings (shop configuration)

## Step 2: Set Up Categories

Before adding products, create your real product categories via the admin panel:

1. Go to: http://localhost:3000/admin/categories
2. Click **"New Category"**
3. For each category, provide:
   - **Name**: e.g., "Gaming Laptops"
   - **Slug**: e.g., "gaming-laptops" (auto-generated)
   - **Description**: Brief category description
   - **Spec Template**: Common specs for this category (e.g., "Processor", "RAM", "Storage", "GPU")
   - **Status**: Active
   - **Sort Order**: Display order on site

**Recommended categories for a computer shop:**
- Computer Accessories
- Office Chairs & Desks
- Keyboards & Mice
- Monitors & Displays
- Storage & Memory
- Networking Equipment
- Audio Equipment

## Step 3: Set Up Delivery Zones

Configure your actual delivery zones:

1. Go to: http://localhost:3000/admin/delivery
2. Under **"Delivery Zones"**, click **"Add Zone"**
3. For each zone:
   - **Zone Name**: e.g., "Accra Central"
   - **Delivery Fee**: In pesewas (e.g., 3500 = GHS 35.00)
   - **Estimated Days**: e.g., "Same day delivery"
   - **Status**: Active

**Example zones for Ghana:**
- Accra Central: GHS 20-30 (same day)
- Greater Accra: GHS 40-60 (1-2 days)
- Regional Cities: GHS 80-100 (2-3 days)

## Step 4: Set Up Pickup Locations

Configure your physical store locations:

1. Go to: http://localhost:3000/admin/delivery
2. Under **"Pickup Locations"**, click **"Add Location"**
3. For each location:
   - **Location Name**: e.g., "MB Ventures Main Store"
   - **Address**: Full street address
   - **Phone**: Contact number
   - **Opening Hours**: e.g., "Mon-Fri: 8AM-6PM, Sat: 9AM-3PM"
   - **Status**: Active

## Step 5: Update Site Settings

Update your shop configuration with real information:

1. Go to: http://localhost:3000/admin/settings
2. Update all fields:
   - **Shop Name**: MB Ventures GH
   - **Contact Email**: Your real email
   - **Contact Phone**: Your real phone number
   - **WhatsApp Number**: Your WhatsApp business number
   - **Address**: Your physical store address
   - **MoMo Accounts**: Your actual MTN/Vodafone/AirtelTigo numbers
   - **Announcement Bar**: Current promotions or delivery info
   - **Hero Section**: Homepage headline and call-to-action

## Step 6: Add Real Products

Now you're ready to add real products:

### Via Admin Panel (Recommended for a few products)

1. Go to: http://localhost:3000/admin/products
2. Click **"New Product"**
3. Fill in the product form:

**Basic Information:**
- **Product Name**: Full descriptive name
- **SKU**: Your internal product code
- **Category**: Select from dropdown
- **Brand**: Manufacturer name
- **Description**: Detailed product description

**Pricing & Stock:**
- **Price**: In pesewas (e.g., 320000 = GHS 3,200.00)
- **Sale Price**: Optional discounted price
- **Stock**: Current inventory count

**Images:**
- Upload product photos (drag & drop or click to browse)
- First image becomes the main thumbnail
- Maximum recommended: 5-8 images per product

**Specifications:**
- Add key specs based on category template
- Group by section (e.g., "Performance", "Build", "Warranty")
- Use clear labels and values

**Status:**
- **Active**: Product visible in store
- **Featured**: Appears on homepage

4. Click **"Create Product"**

### Via CSV Import (For bulk products)

Go to: http://localhost:3000/admin/inventory

Use the **"Import Products"** feature to upload a CSV file with:
- Product name, SKU, category, brand
- Price, stock, description
- Specifications (as JSON or comma-separated)

CSV format:
```csv
name,sku,categorySlug,brand,price,stock,description,isActive,isFeatured
"Product Name","SKU-001","category-slug","Brand",320000,10,"Description",true,false
```

## Step 7: Product Images Best Practices

**Image requirements:**
- **Format**: JPEG or PNG
- **Recommended size**: 1200x1200px (square) or 1200x800px (landscape)
- **File size**: Under 2MB per image
- **Background**: White or transparent preferred
- **Minimum resolution**: 800x800px

**Photography tips:**
- Use good lighting (natural or studio)
- Multiple angles (front, side, back, detail shots)
- Show product in use context when relevant
- Include packaging for new/sealed items
- Consistent styling across all products

## Step 8: Product Descriptions

**Good product descriptions include:**
1. **Opening hook**: Key benefit or feature
2. **Detailed specs**: Technical specifications
3. **Use cases**: Who it's for, what problems it solves
4. **What's included**: Box contents, accessories
5. **Warranty info**: Coverage and support

**Example structure:**
```
[Hook] Professional-grade ergonomic chair for all-day comfort.

[Features] Features adjustable lumbar support, 3D armrests, and breathable mesh back. 
Supports up to 150kg with a heavy-duty aluminum base.

[Use case] Perfect for office professionals, gamers, and remote workers who spend 
8+ hours at their desk.

[Included] Includes assembly tools, instruction manual, and 3-year warranty.
```

## Step 9: Stock Management

After adding products:

1. **Set realistic stock levels**: Start with actual inventory
2. **Monitor low stock**: Products below 3 units show warnings
3. **Use stock adjustments**: Track receiving, damage, returns via Admin > Inventory
4. **Reserved stock**: Automatically managed by unpaid orders

## Step 10: Product Organization

**Best practices:**
- Use **Featured** flag for bestsellers and promotions
- Keep **SKUs** consistent and unique
- Group related products with **categories**
- Use clear, searchable **product names**
- Add **brand** for filtering and trust
- Set accurate **specs** for comparison

## Testing Your Products

Before going live:

1. ✓ Visit catalog page: http://localhost:3000/catalog
2. ✓ Check category pages work
3. ✓ Click into product detail pages
4. ✓ Add to cart and test checkout flow
5. ✓ Place a test order
6. ✓ Verify order appears in Admin > Orders
7. ✓ Check email notifications (dry-run mode)
8. ✓ Test search functionality
9. ✓ Check mobile responsiveness

## Going Live Checklist

- [ ] All demo data cleared
- [ ] Real categories created
- [ ] Delivery zones configured
- [ ] Pickup locations added
- [ ] Site settings updated with real contact info
- [ ] MoMo account numbers verified
- [ ] Products added with photos
- [ ] Product descriptions proofread
- [ ] Prices verified (in pesewas!)
- [ ] Stock counts accurate
- [ ] Test order completed successfully
- [ ] Email system configured (RESEND_API_KEY set)
- [ ] Pushed to production deployment

## Need Help?

- **Product photos**: Consider hiring a photographer or using good smartphone camera
- **Product descriptions**: Use manufacturer specs as starting point, add your expertise
- **Pricing**: Research competitors, factor in delivery, import, and margins
- **Stock tracking**: Start conservative, restock based on demand

---

**Ready to add products?** Start with Step 1 to clear mock data!
