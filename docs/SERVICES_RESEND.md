# Resend Email Setup Guide

This guide explains how to set up Resend for email functionality in the SoloSuccess Intel Academy platform.

## Why Resend?

Resend provides:
- Modern, developer-friendly API
- 100 emails/day on free tier
- No domain required (can verify single sender email)
- Excellent deliverability
- Simple integration

## Setup Steps

### 1. Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Log in to your Resend dashboard
2. Navigate to **API Keys** in the sidebar
3. Click **Create API Key**
4. Give it a name (e.g., "SoloSuccess Development")
5. Copy the API key (it starts with `re_`)
6. **Important:** Save this key - you won't be able to see it again!

### 3. Verify Your Sender Email

Since you don't have a custom domain, you'll verify a single email address:

1. In the Resend dashboard, go to **Domains** or **Emails**
2. Click **Add Email** or **Verify Email**
3. Enter your email address (e.g., your Gmail address)
4. Check your inbox for a verification email from Resend
5. Click the verification link
6. Once verified, you can send emails from this address

### 4. Configure Environment Variables

Add the following to your `.env` file in the backend directory:

```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=your-verified-email@gmail.com
```

Replace:
- `re_your_api_key_here` with your actual Resend API key
- `your-verified-email@gmail.com` with the email you verified in step 3

### 5. Test the Configuration

Start the backend server and try these features:

1. **Register a new account** - Should send a welcome email
2. **Request password reset** - Should send a password reset email
3. **Complete a course** - Should send a completion email with certificate

Check your email inbox (and spam folder) for the emails.

## Email Features

The platform sends emails for:

1. **Welcome Email** - When a user registers
2. **Password Reset** - When a user requests to reset their password
3. **Course Completion** - When a user completes a course (includes certificate link)

## Fallback Behavior

If Resend is not configured (missing API key), the system will:
- Log password reset links to the console instead of sending emails
- Skip welcome and completion emails
- Continue to function normally for all other features

## Free Tier Limits

Resend's free tier includes:
- 100 emails per day
- 3,000 emails per month
- All features included
- No credit card required

This is perfect for development and small-scale production use.

## Upgrading to Custom Domain (Optional)

When you're ready to use a custom domain:

1. Purchase a domain (e.g., from Namecheap, Google Domains)
2. In Resend dashboard, go to **Domains**
3. Click **Add Domain**
4. Follow the DNS configuration instructions
5. Update `EMAIL_FROM` in your `.env` to use your domain (e.g., `noreply@yourdomain.com`)

## Troubleshooting

### Emails not sending

1. Check that `RESEND_API_KEY` is set in `.env`
2. Verify your sender email is verified in Resend dashboard
3. Check the backend console for error messages
4. Verify the API key is correct (starts with `re_`)

### Emails going to spam

- This is common with free email addresses (Gmail, etc.)
- Using a custom domain with proper DNS records improves deliverability
- Resend provides good deliverability even without a custom domain

### API key not working

- Make sure you copied the entire key (starts with `re_`)
- Check for extra spaces or line breaks
- Regenerate the key if needed in Resend dashboard

## Support

- Resend Documentation: [https://resend.com/docs](https://resend.com/docs)
- Resend Support: Available through dashboard

