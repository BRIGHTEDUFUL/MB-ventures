# Production Environment Setup Script (PowerShell)
# MB Ventures GH - Convex Backend Configuration
# Deployment: hardy-blackbird-20

$ErrorActionPreference = "Stop"

Write-Host "🚀 MB Ventures GH - Production Environment Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Must run from project root directory" -ForegroundColor Red
    exit 1
}

# Check if npm is available
try {
    npx --version | Out-Null
} catch {
    Write-Host "❌ Error: npx not found. Please install Node.js" -ForegroundColor Red
    exit 1
}

Write-Host "📋 This script will configure environment variables for production deployment:" -ForegroundColor Yellow
Write-Host "   Deployment: hardy-blackbird-20.convex.cloud" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "⚠️  This will set PRODUCTION environment variables. Continue? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "❌ Aborted" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🔧 Setting up production environment variables..." -ForegroundColor Cyan
Write-Host ""

# Production Site URL
$PROD_SITE_URL = Read-Host "Enter production site URL (e.g., https://mbventuresgh.com)"
if ([string]::IsNullOrWhiteSpace($PROD_SITE_URL)) {
    Write-Host "❌ Error: Site URL is required" -ForegroundColor Red
    exit 1
}

# Resend API Key
Write-Host ""
Write-Host "📧 Email Configuration (Resend)" -ForegroundColor Cyan
Write-Host "Get your API key from: https://resend.com/api-keys" -ForegroundColor Gray
$RESEND_KEY = Read-Host "Enter Resend API key"
if ([string]::IsNullOrWhiteSpace($RESEND_KEY)) {
    Write-Host "⚠️  Warning: Email service will not work without Resend API key" -ForegroundColor Yellow
    $RESEND_KEY = "not_set"
}

# Email From Address
$EMAIL_FROM = Read-Host "Enter sender email (e.g., orders at mbventuresgh.com)"
if ([string]::IsNullOrWhiteSpace($EMAIL_FROM)) {
    $EMAIL_FROM = "orders@mbventuresgh.com"
}

# Admin Alert Email
$ADMIN_EMAIL = Read-Host "Enter admin alert email (full address)"
if ([string]::IsNullOrWhiteSpace($ADMIN_EMAIL)) {
    $ADMIN_EMAIL = "admin@mbventuresgh.com"
}

Write-Host ""
Write-Host "🔑 Authentication Configuration" -ForegroundColor Cyan
Write-Host "Note: JWT keys should already be set from development. Checking..." -ForegroundColor Gray

Write-Host ""
Write-Host "📝 Summary of variables to be set:" -ForegroundColor Cyan
Write-Host "-----------------------------------" -ForegroundColor Gray
Write-Host "SITE_URL: $PROD_SITE_URL" -ForegroundColor White
Write-Host "RESEND_API_KEY: $($RESEND_KEY.Substring(0, [Math]::Min(10, $RESEND_KEY.Length)))..." -ForegroundColor White
Write-Host "EMAIL_FROM: $EMAIL_FROM" -ForegroundColor White
Write-Host "ADMIN_ALERT_EMAIL: $ADMIN_EMAIL" -ForegroundColor White
Write-Host ""

$proceed = Read-Host "Proceed with setting these variables? (yes/no)"
if ($proceed -ne "yes") {
    Write-Host "❌ Aborted" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🔄 Setting environment variables..." -ForegroundColor Cyan

try {
    # Set environment variables for production
    npx convex env set SITE_URL "$PROD_SITE_URL" --prod
    npx convex env set RESEND_API_KEY "$RESEND_KEY" --prod
    npx convex env set EMAIL_FROM "$EMAIL_FROM" --prod
    npx convex env set ADMIN_ALERT_EMAIL "$ADMIN_EMAIL" --prod

    Write-Host ""
    Write-Host "✅ Production environment variables set successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Update your .env.local for production testing:" -ForegroundColor White
    Write-Host "   NEXT_PUBLIC_CONVEX_URL=https://hardy-blackbird-20.convex.cloud" -ForegroundColor Gray
    Write-Host "   NEXT_PUBLIC_SITE_URL=$PROD_SITE_URL" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Deploy functions to production:" -ForegroundColor White
    Write-Host "   npx convex deploy --prod" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Test the deployment:" -ForegroundColor White
    Write-Host "   npm run build && npm start" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Verify email sending works" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 Production setup complete!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Error setting environment variables: $_" -ForegroundColor Red
    exit 1
}
