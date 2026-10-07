/**
 * Upload gaming desk image to Convex and attach to product
 * Run with: node scripts/upload-gaming-desk-image.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read the image file
const imagePath = path.join(__dirname, '..', 'public', 'products', 'gaming-desk-carbon-fiber.jpeg');

if (!fs.existsSync(imagePath)) {
  console.error('❌ Image file not found:', imagePath);
  process.exit(1);
}

console.log('📸 Found image:', imagePath);
console.log('📤 Uploading to Convex...');

// Note: This requires manual upload via admin panel
// Convex file upload requires authenticated requests

console.log(`
╔════════════════════════════════════════════════════════════════╗
║              UPLOAD GAMING DESK IMAGE                          ║
║                                                                ║
║  The image needs to be uploaded via the admin panel:          ║
║                                                                ║
║  1. Open: http://localhost:3000/admin/products                 ║
║  2. Click on "Black Carbon Fiber E-Sports Gaming Desk"         ║
║  3. Click "Edit" button                                        ║
║  4. In the Images section, click "Upload Image"                ║
║  5. Select: public/products/gaming-desk-carbon-fiber.jpeg      ║
║  6. Wait for upload to complete                                ║
║  7. Click "Save Changes"                                       ║
║                                                                ║
║  The image will then show on:                                  ║
║  - Product detail page                                         ║
║  - Catalog listings                                            ║
║  - Homepage featured section                                   ║
╚════════════════════════════════════════════════════════════════╝
`);

console.log('Image path:', imagePath);
console.log('Image exists:', fs.existsSync(imagePath));
console.log('Image size:', fs.statSync(imagePath).size, 'bytes');
