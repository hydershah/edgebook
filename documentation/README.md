# Sports Predictions Social Platform

A sports community platform that combines social media features with a marketplace for sports picks. Users can share their picks, follow top performers, purchase premium picks, and get AI-powered sports insights.

## Features

- **Social Feed**: View and filter picks from the community
- **Create Picks**: Share sports insights with customizable options (sport, confidence, premium/free)
- **Trending Analysts**: Discover top performers with proven track records
- **AI Sports Analyst**: Get personalized sports insights with OpenAI-powered chat
- **Premium Picks**: Monetize your picks with a 15% platform fee
- **Follow System**: Follow your favorite analysts
- **Payment Integration**: Secure payments via Stripe
- **File Uploads**: Add photos/videos to your picks (AWS S3)
- **Responsible Use**: Built-in responsible use features and resources

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **AI**: OpenAI GPT-4
- **File Storage**: AWS S3
- **Deployment**: Vercel (recommended)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ and npm
- PostgreSQL database
- Stripe account
- OpenAI API key
- AWS account (for S3)

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <your-project-directory>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then fill in your environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
```

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

### PostgreSQL Setup

1. Install PostgreSQL on your machine
2. Create a new database:

```sql
CREATE DATABASE your_database_name;
```

3. Update the `DATABASE_URL` in your `.env` file with your credentials

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a migration
npx prisma migrate dev --name description

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Set up webhooks:
   - In the Stripe Dashboard, go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## AWS S3 Setup

1. Create an AWS account
2. Create an S3 bucket:
   - Go to S3 in AWS Console
   - Create a new bucket with a unique name
   - Enable public access for uploaded files
   - Set up CORS configuration
3. Create IAM user with S3 permissions:
   - Go to IAM → Users → Add User
   - Attach `AmazonS3FullAccess` policy
   - Save the Access Key ID and Secret Access Key

### S3 CORS Configuration

Add this CORS configuration to your S3 bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## OpenAI Setup

1. Create an OpenAI account at [platform.openai.com](https://platform.openai.com)
2. Generate an API key
3. Add credits to your account
4. Copy the API key to `OPENAI_API_KEY` in your `.env` file

## Project Structure

```
project-root/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication
│   │   ├── picks/        # Pick CRUD operations
│   │   ├── chats/        # AI analyst chat
│   │   ├── payments/     # Stripe integration
│   │   └── upload/       # File uploads
│   ├── feed/             # Main feed page
│   ├── createpick/       # Create pick page
│   ├── trending/         # Trending analysts page
│   ├── aianalyst/        # AI analyst page
│   ├── legal/            # Legal pages
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/           # Reusable components
├── lib/                  # Utility functions
├── prisma/               # Database schema
├── types/                # TypeScript types
└── public/               # Static assets
```

## Key Features Implementation

### Authentication
- NextAuth.js with credentials provider
- Session-based authentication
- Protected API routes

### Picks System
- Create, read, update picks
- Filter by sport, status, units
- Premium/free picks
- Confidence levels (1-5 units)

### Payment System
- Stripe payment intents
- 15% platform fee
- Purchase tracking
- Transaction history

### AI Analyst
- OpenAI GPT-4 integration
- Chat history persistence
- Personalized sports insights

### File Uploads
- AWS S3 integration
- Image and video support
- Max 5-minute videos
- 50MB file size limit

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your production environment:
- Update `NEXTAUTH_URL` to your production URL
- Use production Stripe keys
- Set strong `NEXTAUTH_SECRET`

## Security Considerations

- Never commit `.env` file
- Use strong secrets for `NEXTAUTH_SECRET`
- Validate all user inputs
- Implement rate limiting for API routes
- Use HTTPS in production
- Regularly update dependencies

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please refer to the project documentation or create an issue in the repository.

## Responsible Use

This platform promotes responsible use. If you need help with problem gambling, please seek appropriate resources.

You must be 18+ to use this platform. Please play responsibly.
