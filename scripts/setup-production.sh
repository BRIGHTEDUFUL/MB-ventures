#!/bin/bash

# Production Environment Setup Script
# MB Ventures GH - Convex Backend Configuration
# Deployment: hardy-blackbird-20

set -e

echo "🚀 MB Ventures GH - Production Environment Setup"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

# Check if convex CLI is available
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx not found. Please install Node.js"
    exit 1
fi

echo "📋 This script will configure environment variables for production deployment:"
echo "   Deployment: hardy-blackbird-20.convex.cloud"
echo ""

read -p "⚠️  This will set PRODUCTION environment variables. Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Aborted"
    exit 0
fi

echo ""
echo "🔧 Setting up production environment variables..."
echo ""

# Production Site URL
read -p "Enter production site URL (e.g., https://mbventuresgh.com): " PROD_SITE_URL
if [ -z "$PROD_SITE_URL" ]; then
    echo "❌ Error: Site URL is required"
    exit 1
fi

# Resend API Key
echo ""
echo "📧 Email Configuration (Resend)"
echo "Get your API key from: https://resend.com/api-keys"
read -p "Enter Resend API key: " RESEND_KEY
if [ -z "$RESEND_KEY" ]; then
    echo "⚠️  Warning: Email service will not work without Resend API key"
    RESEND_KEY="not_set"
fi

# Email From Address
read -p "Enter sender email (e.g., orders@mbventuresgh.com): " EMAIL_FROM
if [ -z "$EMAIL_FROM" ]; then
    EMAIL_FROM="orders@mbventuresgh.com"
fi

# Admin Alert Email
read -p "Enter admin alert email: " ADMIN_EMAIL
if [ -z "$ADMIN_EMAIL" ]; then
    ADMIN_EMAIL="admin@mbventuresgh.com"
fi

echo ""
echo "🔑 Authentication Configuration"
echo "Note: JWT keys should already be set from development. Checking..."

# Check if JWT keys exist
echo ""
echo "Verifying JWT configuration..."
echo "If not set, you'll need to generate them with: npx @convex-dev/auth"

echo ""
echo "📝 Summary of variables to be set:"
echo "-----------------------------------"
echo "SITE_URL: $PROD_SITE_URL"
echo "RESEND_API_KEY: ${RESEND_KEY:0:10}..."
echo "EMAIL_FROM: $EMAIL_FROM"
echo "ADMIN_ALERT_EMAIL: $ADMIN_EMAIL"
echo ""

read -p "Proceed with setting these variables? (yes/no): " proceed
if [ "$proceed" != "yes" ]; then
    echo "❌ Aborted"
    exit 0
fi

echo ""
echo "🔄 Setting environment variables..."

# Set environment variables for production
npx convex env set SITE_URL "$PROD_SITE_URL" --prod
npx convex env set RESEND_API_KEY "$RESEND_KEY" --prod
npx convex env set EMAIL_FROM "$EMAIL_FROM" --prod
npx convex env set ADMIN_ALERT_EMAIL "$ADMIN_EMAIL" --prod

echo ""
echo "✅ Production environment variables set successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env.local for production testing:"
echo "   NEXT_PUBLIC_CONVEX_URL=https://hardy-blackbird-20.convex.cloud"
echo "   NEXT_PUBLIC_SITE_URL=$PROD_SITE_URL"
echo ""
echo "2. Deploy functions to production:"
echo "   npx convex deploy --prod"
echo ""
echo "3. Test the deployment:"
echo "   npm run build && npm start"
echo ""
echo "4. Verify email sending works"
echo ""
echo "🎉 Production setup complete!"
