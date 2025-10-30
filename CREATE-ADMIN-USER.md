# Creating an Admin User for EdgeBook

## Method 1: Update Existing User to Admin

### Using Database Query

```sql
-- Update an existing user to admin role
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'your-email@example.com';

-- Verify the change
SELECT id, email, username, role
FROM "User"
WHERE role = 'ADMIN';
```

### Using Prisma Studio

1. Open Prisma Studio:
```bash
npx prisma studio
```

2. Navigate to the `User` model
3. Find your user by email
4. Change the `role` field to `ADMIN`
5. Click Save

---

## Method 2: Create New Admin User via Database

```sql
-- Insert new admin user (you'll need to hash the password first)
INSERT INTO "User" (
  id,
  email,
  username,
  name,
  password,
  role,
  "isVerified",
  "emailVerified",
  "createdAt",
  "updatedAt"
) VALUES (
  'admin-' || gen_random_uuid()::text,
  'admin@edgebook.com',
  'admin',
  'Admin User',
  '$2a$10$...',  -- Replace with bcrypt hashed password
  'ADMIN',
  true,
  NOW(),
  NOW(),
  NOW()
);
```

---

## Method 3: Create Admin User via Application

### Step 1: Sign up normally through the app

1. Go to: `http://localhost:3000/auth/signup`
2. Create an account with your email
3. Complete email verification if required

### Step 2: Promote to admin

Then run this SQL:

```sql
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'the-email-you-just-signed-up-with@example.com';
```

---

## Method 4: Quick Admin Setup Script

Create a file: `scripts/create-admin.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@edgebook.com';
  const password = 'AdminPassword123!'; // CHANGE THIS!

  // Check if admin already exists
  const existing = await prisma.user.findUnique({
    where: { email }
  });

  if (existing) {
    console.log('Admin user already exists, updating role...');
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN', isVerified: true }
    });
    console.log('✅ User updated to ADMIN');
    return;
  }

  // Create new admin
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      email,
      username: 'admin',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
      emailVerified: new Date(),
    }
  });

  console.log('✅ Admin user created:');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('IMPORTANT: Change the password after first login!');
}

createAdmin()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
```

Run it:
```bash
npx ts-node scripts/create-admin.ts
```

---

## Method 5: Using Prisma Seed

Add to `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@edgebook.com' },
    update: {
      role: 'ADMIN',
      isVerified: true,
    },
    create: {
      email: 'admin@edgebook.com',
      username: 'admin',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
      emailVerified: new Date(),
    },
  });

  console.log('Admin user:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```bash
npx prisma db seed
```

---

## Quick SQL Command (Recommended)

**Easiest method** - Update any existing user:

```bash
# Connect to your database
DATABASE_URL="postgresql://postgres:nLwmRyQbfAlGuqbHCJXZiMYcWRsxoMQv@shortline.proxy.rlwy.net:35590/railway" psql

# Then run:
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

Or using the npm script:

```bash
DATABASE_URL="postgresql://postgres:nLwmRyQbfAlGuqbHCJXZiMYcWRsxoMQv@shortline.proxy.rlwy.net:35590/railway" psql -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'your-email@example.com';"
```

---

## After Granting Admin Access

### Access the Admin Dashboard

1. **URL**: `http://localhost:3000/admin/dashboard`
2. **Login**: Use the email/password of the user you made admin
3. **Navigation**: Use the sidebar to access all admin features

### Available Admin Pages

- `/admin/dashboard` - Overview with KPIs
- `/admin/users` - User management
- `/admin/moderation` - Report queue
- `/admin/picks` - Pick moderation
- `/admin/transactions` - Transaction monitoring
- `/admin/payouts` - Payout approval
- `/admin/disputes` - Dispute resolution
- `/admin/analytics` - Platform analytics
- `/admin/audit-logs` - Audit log viewer
- `/admin/settings` - Platform settings

---

## Security Recommendations

1. **Use Strong Passwords**: Always use strong, unique passwords for admin accounts
2. **Enable 2FA**: Consider enabling two-factor authentication for admin users
3. **Limit Admin Accounts**: Only create admin accounts for trusted users
4. **Monitor Audit Logs**: Regularly review admin actions in the audit logs
5. **Change Default Passwords**: If you use a seed/script, change the password immediately

---

## Troubleshooting

### Can't Access Admin Dashboard?

1. **Check your role**:
```sql
SELECT email, role FROM "User" WHERE email = 'your-email@example.com';
```

2. **Verify session**: Make sure you're logged in with the admin user

3. **Clear cache**: Clear browser cache and cookies, then log in again

4. **Check middleware**: Verify `/middleware.ts` is working correctly

### "Forbidden" Error?

- Your user role must be `ADMIN` or `MODERATOR`
- Check database: `role` column should be `'ADMIN'` (not `'USER'`)

### Can't Log In?

- Verify email is correct
- Check password was set correctly
- Verify `emailVerified` is not null (or set `isVerified` to true)

---

## Example: Quick Setup

```bash
# 1. Open Prisma Studio
npx prisma studio

# 2. Go to User model
# 3. Find your user or create new one
# 4. Set role = "ADMIN"
# 5. Set isVerified = true
# 6. Save

# 7. Access admin dashboard
# Navigate to: http://localhost:3000/admin/dashboard
```

---

## Creating Moderator Users

For moderators (limited admin access):

```sql
UPDATE "User"
SET role = 'MODERATOR'
WHERE email = 'moderator@example.com';
```

**Moderator Permissions:**
- Can view and moderate content
- Can manage reports
- Can ban/suspend users
- **Cannot** delete users
- **Cannot** approve payouts (admin-only)

---

## Default Credentials (If You Create Seed File)

If you use the seed method above:

```
Email: admin@edgebook.com
Password: Admin123!
```

**⚠️ IMPORTANT: Change this password immediately after first login!**

---

*For more information, see the admin dashboard documentation.*
