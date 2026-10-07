# Email System Documentation

## Overview

MB Ventures GH uses Resend for transactional emails with a **dry-run mode** that allows the entire application to work without email credentials. This means you can develop, test, and even deploy without configuring email—real sending is opt-in via environment variables.

## How It Works

### Two Modes

**Dry-run mode** (default when credentials are missing):
- All email logic runs normally
- Templates are rendered with real data
- Emails are logged to the `emailLogs` table with full HTML/text
- Nothing is sent over the network
- Safe for development and testing

**Live mode** (when both `RESEND_API_KEY` and `EMAIL_FROM` are set):
- Emails are sent via Resend API
- HTML/text are NOT stored in logs (privacy)
- Includes retry logic for network failures
- Respects daily sending limits

### Mode Detection

The system automatically detects which mode to run in at runtime based on environment variables. No code changes needed—just set the variables and go live.

## Email Templates

### Customer Emails
- **Order Confirmation** - Sent immediately after order placement
- **Order Status Updates** - Sent when order status changes (ready for pickup, out for delivery, completed)

### Admin Emails
- **New Order Alert** - Sent when a customer places an order
- **New Contact Message** - Sent when someone submits the contact form

### Auth Emails (future)
- **Email Verification** - Sent during sign-up
- **Password Reset** - Sent when user requests password reset

All templates use a consistent layout with your shop branding, are mobile-responsive, and include plain-text versions for email clients that don't support HTML.

## Safety Features

### Rate Limiting
- Contact form emails: max 5 per recipient per hour
- Auth emails: max 5 per recipient per hour (prevents abuse)

### Daily Limit
- Configurable via `EMAIL_DAILY_LIMIT` (default: 100 emails/day)
- Prevents runaway sending costs
- Admin is notified once per day when limit is reached

### Suppression List
- Automatically blocks emails that bounce or generate complaints
- Prevents wasting API quota on bad addresses
- Admin can manually remove addresses from suppression list

### Deduplication
- Same template + order within 60 seconds = skipped
- Prevents double-sending if mutation retries

### Never Breaks Business Logic
- All emails sent via `ctx.scheduler.runAfter(0, ...)`
- Email failures never cause order placement or other mutations to fail
- Failures are logged but don't throw

## Monitoring

### Admin Dashboard
Visit `/admin/emails` to:
- See current mode (dry-run or live)
- Monitor daily sending quota usage
- View all sent/failed emails
- Preview email HTML (dry-run mode only)
- Check error messages for failed sends

### Development
In dry-run mode with `EMAIL_DRY_RUN_LOG_CODES=true` (localhost only):
- Auth verification codes are logged to console
- Makes local testing of sign-up/reset flows easy
- Automatically disabled for production URLs (safety check)

## Going Live

### Prerequisites
1. **Resend Account**: Sign up at https://resend.com (free tier: 3,000 emails/month)
2. **Domain Verification**: Add SPF and DKIM DNS records for your sending domain
3. **API Key**: Create one in Resend dashboard

### Configuration Steps

1. **Set environment variables** on your Convex deployment:
   ```bash
   npx convex env set RESEND_API_KEY "re_your_api_key_here" --prod
   npx convex env set EMAIL_FROM "MB Ventures GH <orders@yourdomain.com>" --prod
   npx convex env set ADMIN_ALERT_EMAIL "admin@yourdomain.com" --prod
   ```

2. **Optional variables**:
   ```bash
   npx convex env set EMAIL_REPLY_TO "support@yourdomain.com" --prod
   npx convex env set EMAIL_DAILY_LIMIT "500" --prod
   ```

3. **Deploy** (if not already deployed):
   ```bash
   npx convex deploy --prod
   ```

4. **Test**:
   - Place a test order
   - Submit contact form
   - Check `/admin/emails` for delivery status
   - Verify emails arrive in inbox

### DNS Records

In your domain's DNS settings, add these records (values from Resend dashboard):

```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

Type: TXT  
Name: resend._domainkey
Value: [long key from Resend dashboard]

Type: MX
Name: @
Value: feedback-smtp.resend.com (priority: 10)
```

Wait 10-60 minutes for DNS propagation, then verify in Resend dashboard.

## Troubleshooting

### Emails Not Sending

**Check mode**: Visit `/admin/emails` - banner shows current mode
- If "dry-run", set `RESEND_API_KEY` and `EMAIL_FROM`

**Check daily limit**: Dashboard shows `X / Y` sent today
- If at limit, wait until tomorrow or increase `EMAIL_DAILY_LIMIT`

**Check suppression list**: Email might be blocked
- View suppressed emails in admin
- Remove if it was a mistake

**Check Resend logs**: https://resend.com/logs
- See delivery status, bounces, errors
- Verify API key is working

### Domain Not Verified

Emails will fail with "Domain not verified" error:
1. Go to Resend dashboard → Domains
2. Check verification status
3. Add/fix DNS records
4. Wait for propagation
5. Click "Verify" in Resend

### Wrong Sender Domain

`EMAIL_FROM` domain must match verified domain in Resend:
- ✅ `"Shop <orders@example.com>"` if `example.com` is verified
- ❌ `"Shop <orders@gmail.com>"` will be rejected

### Dry-Run in Production

If you deployed without setting credentials:
- App works fine, emails just aren't sent
- Set credentials and redeploy when ready
- No code changes needed

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RESEND_API_KEY` | Yes (for live) | - | Resend API key starting with `re_` |
| `EMAIL_FROM` | Yes (for live) | - | Sender address, format: `"Name <email@domain.com>"` |
| `ADMIN_ALERT_EMAIL` | Recommended | - | Where admin notifications are sent |
| `EMAIL_REPLY_TO` | No | - | Reply-to address (if different from sender) |
| `EMAIL_DAILY_LIMIT` | No | 100 | Max emails per day (safety limit) |
| `EMAIL_DRY_RUN_LOG_CODES` | No | false | Log auth codes to console (dev only) |
| `RESEND_WEBHOOK_SECRET` | No | - | For delivery tracking (future feature) |

## Files Structure

```
convex/emails/
├── config.ts           # Mode detection, env var reading
├── transport.ts        # Resend API integration
├── send.ts             # Main sending pipeline
├── mutations.ts        # Database operations
├── queries.ts          # Queries for limits, duplicates
├── admin.ts            # Admin dashboard queries
├── triggers.ts         # Helper functions to schedule emails
└── templates/
    ├── layout.ts       # Base HTML layout
    ├── orderConfirmation.ts
    ├── orderStatusUpdate.ts
    ├── newOrderAdmin.ts
    ├── newContactMessage.ts
    └── authCode.ts

app/admin/emails/       # Admin UI page
docs/EMAIL.md           # This file
```

## Best Practices

1. **Always test in dry-run first** - Verify templates render correctly
2. **Monitor the logs** - Check `/admin/emails` regularly
3. **Set realistic limits** - Don't exceed your Resend plan
4. **Verify domain properly** - SPF + DKIM prevents spam folder
5. **Use meaningful sender names** - "Shop Name" not "noreply"
6. **Keep templates simple** - Email clients have limited CSS support
7. **Test on real devices** - Desktop + mobile, multiple email clients

## Future Enhancements

Ready to implement when needed:
- Webhook endpoint for delivery/bounce tracking
- Additional templates (refund processed, low stock alert)
- Email preferences (let customers opt out of marketing)
- Template preview page for admins
- Send test email button
- Rich admin analytics dashboard
