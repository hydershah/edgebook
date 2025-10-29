# EdgeBook - Quick Start Guide

Get EdgeBook up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed and running
- Stripe account (for payments)
- OpenAI API key (for AI analyst)
- AWS account (for file uploads)

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Database (update with your PostgreSQL credentials)
DATABASE_URL="postgresql://postgres:password@localhost:5432/edgebook"

# NextAuth (generate a random secret)
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# OpenAI (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY="sk-..."

# AWS S3 (create in AWS Console)
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="edgebook-uploads"
```

### 3. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## First Steps

### Create Your First User

1. Go to http://localhost:3000/auth/signup
2. Create an account
3. Sign in at http://localhost:3000/auth/signin

### Explore the Features

1. **Feed** - View all picks (empty at first)
2. **Create Pick** - Share your first pick
3. **Trending** - See top performers (needs 5+ picks per user)
4. **AI Analyst** - Chat with AI about prediction strategies

## Common Issues

### Database Connection Error

Make sure PostgreSQL is running:

```bash
# macOS
brew services start postgresql

# Ubuntu
sudo service postgresql start
```

### Prisma Client Not Found

Run:

```bash
npx prisma generate
```

### Port 3000 Already in Use

Change the port:

```bash
PORT=3001 npm run dev
```

## Production Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy!

### Set Up Production Database

Use a managed PostgreSQL service:
- [Supabase](https://supabase.com) (Free tier available)
- [Railway](https://railway.app) (Free tier available)
- [Neon](https://neon.tech) (Free tier available)

Update `DATABASE_URL` in Vercel environment variables.

## Testing Payments

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Use any future expiry date and any 3-digit CVC

## Next Steps

- Customize the UI colors in `tailwind.config.ts`
- Add more sports in `prisma/schema.prisma`
- Implement email notifications
- Add user profiles and statistics
- Set up webhooks for Stripe payments

## Need Help?

- Check the full [README.md](README.md)
- Review the code in `/app` and `/components`
- Check the API routes in `/app/api`

Happy building! 🚀
