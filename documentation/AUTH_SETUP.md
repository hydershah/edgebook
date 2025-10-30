# EdgeBook Authentication Setup Guide

This guide will help you set up the enterprise-grade authentication system for EdgeBook, including social logins (Google, Microsoft, Facebook) and password reset functionality.

## Overview

EdgeBook now supports:
- ✅ Email/Password authentication
- ✅ Google OAuth
- ✅ Microsoft Azure AD OAuth
- ✅ Facebook OAuth
- ✅ Password reset via email
- ✅ Account linking (same email across providers)

## Prerequisites

1. PostgreSQL database
2. OAuth applications created for each provider
3. SMTP server for sending emails

## Step 1: Database Setup

### Run Prisma Migration

```bash
npx prisma migrate dev --name add_oauth_and_password_reset
```

This will create the necessary tables for:
- OAuth accounts (`Account`)
- Session management (`Session`)
- Password reset tokens (`PasswordReset`)

### Generate Prisma Client

```bash
npx prisma generate
```

## Step 2: Environment Variables

Copy [.env.example](.env.example) to `.env` and fill in all values:

```bash
cp .env.example .env
```

### Required Variables

#### Database
```env
DATABASE_URL="postgresql://user:password@localhost:5432/edgebook"
```

#### NextAuth
```env
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"  # Change to your domain in production
```

Generate a secret:
```bash
openssl rand -base64 32
```

## Step 3: OAuth Provider Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy **Client ID** and **Client Secret** to `.env`:

```env
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/apps/)
2. Create a new app
3. Add **Facebook Login** product
4. Go to **Settings** → **Basic**
5. Copy **App ID** and **App Secret**
6. Go to **Facebook Login** → **Settings**
7. Add OAuth redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/facebook`
   - Production: `https://yourdomain.com/api/auth/callback/facebook`
8. Add to `.env`:

```env
FACEBOOK_CLIENT_ID="your-facebook-app-id"
FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"
```

### Microsoft Azure AD OAuth

1. Go to [Azure Portal](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Click **New registration**
3. Name: "EdgeBook"
4. Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
5. Redirect URI:
   - Platform: **Web**
   - Development: `http://localhost:3000/api/auth/callback/azure-ad`
   - Production: `https://yourdomain.com/api/auth/callback/azure-ad`
6. Click **Register**
7. Copy **Application (client) ID** to `.env`
8. Go to **Certificates & secrets** → **New client secret**
9. Create a secret and copy the **Value** to `.env`:

```env
AZURE_AD_CLIENT_ID="your-azure-ad-client-id"
AZURE_AD_CLIENT_SECRET="your-azure-ad-client-secret"
```

## Step 4: Email (SMTP) Setup

Choose one of the following SMTP providers:

### Option 1: Gmail (Recommended for Development)

1. Enable 2-Factor Authentication on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Add to `.env`:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-16-char-app-password"
SMTP_FROM="EdgeBook <noreply@yourdomain.com>"
```

### Option 2: SendGrid (Recommended for Production)

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key
3. Add to `.env`:

```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
SMTP_FROM="EdgeBook <noreply@yourdomain.com>"
```

### Option 3: Mailgun

1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Get SMTP credentials from your domain settings
3. Add to `.env`:

```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="your-mailgun-smtp-username"
SMTP_PASSWORD="your-mailgun-smtp-password"
SMTP_FROM="EdgeBook <noreply@yourdomain.com>"
```

## Step 5: Testing

### Start Development Server

```bash
npm run dev
```

### Test Authentication Flows

1. **Email/Password Signup**
   - Go to `http://localhost:3000/auth/signup`
   - Create an account
   - Check for welcome email

2. **Email/Password Login**
   - Go to `http://localhost:3000/auth/signin`
   - Sign in with your credentials

3. **Social Login**
   - Click "Continue with Google/Microsoft/Facebook"
   - Authorize the application
   - You should be redirected back and logged in

4. **Password Reset**
   - Go to `http://localhost:3000/auth/signin`
   - Click "Forgot password?"
   - Enter your email
   - Check email for reset link
   - Click link and set new password

## File Structure

```
edgebook/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/route.ts       # NextAuth handler
│   │       ├── signup/route.ts              # User registration
│   │       ├── forgot-password/route.ts     # Request password reset
│   │       └── reset-password/route.ts      # Reset password
│   └── auth/
│       ├── signin/page.tsx                  # Login page
│       ├── signup/page.tsx                  # Signup page
│       ├── forgot-password/page.tsx         # Forgot password page
│       └── reset-password/page.tsx          # Reset password page
├── lib/
│   ├── auth.ts                              # NextAuth configuration
│   ├── email.ts                             # Email utilities
│   └── prisma.ts                            # Prisma client
└── prisma/
    └── schema.prisma                        # Database schema
```

## Security Features

### Password Security
- Passwords hashed with bcrypt (10 rounds)
- Minimum 8 character requirement
- Password reset tokens expire after 1 hour
- One-time use tokens

### OAuth Security
- State parameter for CSRF protection
- Secure token storage in database
- Account linking with `allowDangerousEmailAccountLinking`

### Email Security
- Email enumeration prevention (always returns success)
- Secure password reset flow
- Token-based reset (not URL with credentials)

## Production Checklist

Before deploying to production:

- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Use a strong `NEXTAUTH_SECRET` (min 32 characters)
- [ ] Update all OAuth redirect URIs to production URLs
- [ ] Use production SMTP service (SendGrid/Mailgun)
- [ ] Enable SSL/TLS for database connection
- [ ] Set up proper error logging
- [ ] Configure rate limiting on auth endpoints
- [ ] Test all auth flows on production domain
- [ ] Set up email deliverability (SPF, DKIM, DMARC)
- [ ] Monitor failed login attempts

## Troubleshooting

### OAuth Errors

**"Redirect URI mismatch"**
- Ensure redirect URIs match exactly in OAuth console
- Check for trailing slashes
- Verify http vs https

**"Invalid client credentials"**
- Double-check client ID and secret
- Ensure no extra spaces in `.env` file
- Regenerate credentials if needed

### Email Issues

**Emails not sending**
- Check SMTP credentials
- Verify SMTP port (587 for TLS, 465 for SSL)
- Check spam folder
- Review application logs for errors

**Gmail "Less secure apps"**
- Use App Passwords instead
- Don't use regular account password

### Database Issues

**Prisma migration fails**
- Ensure PostgreSQL is running
- Check database connection string
- Verify user permissions
- Run `npx prisma db push` for development

## Support

For issues or questions:
1. Check the [Next-Auth documentation](https://next-auth.js.org/)
2. Review [Prisma documentation](https://www.prisma.io/docs)
3. Open an issue on the repository

## License

This authentication system is part of EdgeBook and follows the same license terms.
