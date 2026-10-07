/**
 * Script to clear all mock/demo data from the Convex database
 * 
 * Usage:
 *   npx convex run clearMockData:clearAllMockData
 * 
 * WARNING: This is a destructive operation!
 * Make sure you have a backup or are running against the dev deployment.
 * 
 * What gets deleted:
 * ✓ All products
 * ✓ All categories
 * ✓ All orders and order items
 * ✓ All cart items
 * ✓ All stock adjustments
 * ✓ All delivery zones
 * ✓ All pickup locations
 * ✓ All contact messages
 * ✓ All custom pages
 * ✓ All saved addresses
 * 
 * What stays:
 * ✓ Users (admin and customer accounts)
 * ✓ Audit logs
 * ✓ Email logs
 * ✓ Site settings (unless you uncomment that section)
 */

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    CLEAR MOCK DATA                             ║
║                                                                ║
║  This script will DELETE all demo data from your database:    ║
║  - Products, Categories, Orders, Cart Items                   ║
║  - Stock Adjustments, Delivery Zones, Pickup Locations        ║
║  - Contact Messages, Custom Pages, Addresses                  ║
║                                                                ║
║  Users, Audit Logs, and Email Logs will be preserved.         ║
║                                                                ║
║  To execute:                                                   ║
║  npx convex run clearMockData:clearAllMockData                 ║
║                                                                ║
║  Make sure you're running against the correct deployment!     ║
╚════════════════════════════════════════════════════════════════╝
`);

export {};
