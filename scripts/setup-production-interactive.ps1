# Production Environment Setup - Interactive
# MB Ventures GH - Convex Backend Configuration

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MB Ventures GH Production Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deployment: hardy-blackbird-20.convex.cloud" -ForegroundColor Yellow
Write-Host ""

# Confirm user wants to proceed
Write-Host "This script will set PRODUCTION environment variables." -ForegroundColor Yellow
$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Aborted." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "Step 1: Production Site URL" -ForegroundColor Cyan
Write-Host "----------------------------------------"
Write-Host "Enter your production website URL"
Write-Host "Example: https://mbventuresgh.com"
$SITE_URL = Read-Host "SITE_URL"

Write-Host ""
Write-Host "Step 2: Resend API Key" -ForegroundColor Cyan
Write-Host "----------------------------------------"
Write-Host "Get your API key from: https://resend.com/api-keys"
Write-Host "It starts with: re_"
$RESEND_KEY = Read-Host "RESEND_API_KEY"

Write-Host ""
Write-Host "Step 3: Sender Email" -ForegroundColor Cyan
Write-Host "----------------------------------------"
Write-Host "Enter the email address for sending order confirmations"
Write-Host "Example: orders" -NoNewline
Write-Host "@" -NoNewline
Write-Host "mbventuresgh.com"
$EMAIL_FROM = Read-Host "EMAIL_FROM"

Write-Host ""
Write-Host "Step 4: Admin Alert Email" -ForegroundColor Cyan
Write-Host "----------------------------------------"
Write-Host "Enter the email address for admin notifications"
Write-Host "Example: admin" -NoNewline
Write-Host "@" -NoNewline
Write-Host "mbventuresgh.com"
$ADMIN_EMAIL = Read-Host "ADMIN_ALERT_EMAIL"

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuration Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "SITE_URL:           $SITE_URL" -ForegroundColor White
Write-Host "RESEND_API_KEY:     $($RESEND_KEY.Substring(0, [Math]::Min(15, $RESEND_KEY.Length)))..." -ForegroundColor White
Write-Host "EMAIL_FROM:         $EMAIL_FROM" -ForegroundColor White
Write-Host "ADMIN_ALERT_EMAIL:  $ADMIN_EMAIL" -ForegroundColor White
Write-Host ""

$proceed = Read-Host "Set these variables? (y/n)"
if ($proceed -ne "y") {
    Write-Host "Aborted." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "Setting environment variables..." -ForegroundColor Cyan

try {
    Write-Host "Setting SITE_URL..." -ForegroundColor Gray
    npx convex env set SITE_URL "$SITE_URL" --prod
    
    Write-Host "Setting RESEND_API_KEY..." -ForegroundColor Gray
    npx convex env set RESEND_API_KEY "$RESEND_KEY" --prod
    
    Write-Host "Setting EMAIL_FROM..." -ForegroundColor Gray
    npx convex env set EMAIL_FROM "$EMAIL_FROM" --prod
    
    Write-Host "Setting ADMIN_ALERT_EMAIL..." -ForegroundColor Gray
    npx convex env set ADMIN_ALERT_EMAIL "$ADMIN_EMAIL" --prod

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SUCCESS!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Production environment variables set!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Deploy to production:" -ForegroundColor White
    Write-Host "   npx convex deploy --prod" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Verify variables are set:" -ForegroundColor White
    Write-Host "   npx convex env list --prod" -ForegroundColor Gray
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "ERROR: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "- Make sure you're logged in: npx convex login" -ForegroundColor Gray
    Write-Host "- Check deployment exists: npx convex deployments list" -ForegroundColor Gray
    exit 1
}
