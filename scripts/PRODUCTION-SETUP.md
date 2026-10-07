# Production Environment Variables Setup

## Prerequisites

Before starting, you need:
1. **Resend API Key**: Get from https://resend.com/api-keys
2. **Production Domain**: Your live website URL (e.g., https://mbventuresgh.com)
3. **Email Addresses**: Sender email and admin alert email

## Environment Variables to Set

You need to set these 4 environment variables on your **hardy-blackbird-20** production deployment:

| Variable | Description | Example |
|----------|-------------|---------|
| `SITE_URL` | Production website URL | `https://mbventuresgh.com` |
| `RESEND_API_KEY` | Resend email service API key | `re_123456789...` |
| `EMAIL_FROM` | Sender email address | `orders@mbventuresgh.com` |
| `ADMIN_ALERT_EMAIL` | Admin notification email | `admin@mbventuresgh.com` |

## Option 1: Set via Command Line (Recommended)

Open PowerShell in your project directory and run these commands **one by one**, replacing the values:

```powershell
# Set production site URL
npx convex env set SITE_URL "https://mbventuresgh.com" --prod

# Set Resend API key (get from https://resend.com/api-keys)
npx convex env set RESEND_API_KEY "re_your_api_key_here" --prod

# Set sender email
npx convex env set EMAIL_FROM "orders@mbventuresgh.com" --prod

# Set admin alert email
npx convex env set ADMIN_ALERT_EMAIL "admin@mbventuresgh.com" --prod
```

## Option 2: Set via Convex Dashboard

1. Go to https://dashboard.convex.dev
2. Select your project: **mb-ventures-gh**
3. Select deployment: **hardy-blackbird-20** (production)
4. Click **Settings** → **Environment Variables**
5. Add each variable manually:
   - Click **Add Environment Variable**
   - Enter name and value
   - Click **Save**

## Option 3: Interactive Setup Script

Run the setup script that will prompt you for each value:

```powershell
# Make sure you're in the project root
cd "C:\Users\NHANA_K_OTTO\Desktop\Online Shop"

# Run the interactive setup
.\scripts\setup-production-interactive.ps1
```

## Verify Configuration

After setting the variables, verify they're set correctly:

```powershell
npx convex env list --prod
```

You should see all 4 variables listed (values will be hidden for security).

## Next Steps

Once environment variables are configured:

1. **Deploy to production:**
   ```powershell
   npx convex deploy --prod
   ```

2. **Update your local .env.local** (for testing against production):
   ```
   CONVEX_DEPLOYMENT=prod:hardy-blackbird-20
   NEXT_PUBLIC_CONVEX_URL=https://hardy-blackbird-20.convex.cloud
   NEXT_PUBLIC_SITE_URL=https://mbventuresgh.com
   ```

3. **Test email functionality:**
   - Place a test order
   - Verify confirmation emails are sent
   - Check admin alert emails work

4. **Test critical flows:**
   - Product catalog browsing
   - Cart and checkout
   - Order placement (all payment methods)
   - Admin dashboard (orders, inventory, settings)

## Troubleshooting

**Error: "Deployment not found"**
- Make sure you're logged in: `npx convex login`
- Verify the deployment name: `npx convex deployments list`

**Error: "Invalid API key"**
- Check your Resend API key is correct
- Ensure you copied the entire key without extra spaces

**Emails not sending:**
- Verify RESEND_API_KEY is set correctly
- Check EMAIL_FROM domain is verified in Resend dashboard
- Review Resend logs at https://resend.com/logs

**Permission issues:**
- Ensure you have admin access to the Convex project
- Ask project owner to grant you access if needed

## Security Notes

- **Never commit** `.env.local` or any file containing API keys to Git
- **Rotate keys** regularly (at least every 90 days)
- **Use different keys** for development and production
- **Monitor usage** in Resend dashboard to detect anomalies
