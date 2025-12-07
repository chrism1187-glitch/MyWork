# Email Setup Guide

MyWork uses [Resend](https://resend.com) for sending invitation emails. Follow these steps to set it up:

## 1. Create a Resend Account

1. Go to https://resend.com
2. Sign up for a free account (100 emails/day free)
3. Verify your email address

## 2. Get Your API Key

1. In the Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Give it a name like "MyWork Production"
4. Copy the API key (starts with `re_`)

## 3. Configure Your Domain (Optional but Recommended)

For production use, you should verify your domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records they provide to your domain registrar
5. Wait for verification (usually a few minutes)

## 4. Add Environment Variables

### Local Development (.env.local):
```env
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="MyWork <onboarding@yourdomain.com>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Production (Vercel):
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add these variables:
   - `RESEND_API_KEY` = your API key
   - `EMAIL_FROM` = `MyWork <onboarding@yourdomain.com>`
   - `NEXT_PUBLIC_APP_URL` = your production URL (e.g., `https://mywork.vercel.app`)
4. Redeploy

## 5. Test Email Delivery

1. Login as admin
2. Click "Invite Worker"
3. Enter a valid email address
4. Check the recipient's inbox (and spam folder)

## Email Template

The invitation email includes:
- Welcome message
- "Accept Invitation" button
- Plain text link (for email clients without HTML support)
- Expiration notice (7 days)

## Troubleshooting

**Emails not sending?**
- Check if `RESEND_API_KEY` is set correctly
- Verify the API key is valid in Resend dashboard
- Check Resend's dashboard for delivery logs
- Ensure sender email matches your verified domain

**Using the free tier?**
- Free tier: 100 emails/day, 3,000/month
- Only send from verified domains in production
- For testing, use the default `onboarding@resend.dev`

## Alternative Email Providers

If you prefer a different email service, you can modify `/src/app/api/invites/route.ts`:

- **SendGrid**: Replace Resend code with SendGrid SDK
- **Mailgun**: Use Mailgun's Node.js library
- **AWS SES**: Use AWS SDK for SES
- **Nodemailer**: Use any SMTP server

The email sending code is isolated in the invites API route for easy customization.
