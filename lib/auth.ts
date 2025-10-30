import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { sendWelcomeEmail } from './email'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET || "MeYjQaKKguioN4dmsgyB2wBT5DkdhbFEnUOGIZ8C6hk=",
  useSecureCookies: process.env.NODE_ENV === 'production',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    // Microsoft Azure AD provider
    {
      id: 'azure-ad',
      name: 'Microsoft',
      type: 'oauth',
      wellKnown: 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration',
      authorization: {
        params: {
          scope: 'openid profile email',
        },
      },
      clientId: process.env.AZURE_AD_CLIENT_ID || '',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    },
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase()
        const password = credentials?.password

        if (!email || !password) {
          throw new Error('Please enter your email and password')
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) {
          throw new Error('No user found with this email')
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signin',
    error: '/auth/signin',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in
      if (account?.provider !== 'credentials') {
        // For OAuth providers, ensure user exists in database
        return true
      }
      return true
    },
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image

        // Fetch emailVerified, role, and account status from database on initial sign in
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            emailVerified: true,
            role: true,
            accountStatus: true,
            suspendedUntil: true,
            suspensionReason: true,
            banReason: true,
            warningCount: true,
            lastWarningAt: true,
          }
        })
        token.emailVerified = dbUser?.emailVerified || null
        token.role = dbUser?.role || 'USER'
        token.accountStatus = dbUser?.accountStatus || 'ACTIVE'
        token.suspendedUntil = dbUser?.suspendedUntil || null
        token.suspensionReason = dbUser?.suspensionReason || null
        token.banReason = dbUser?.banReason || null
        token.warningCount = dbUser?.warningCount || 0
        token.lastWarningAt = dbUser?.lastWarningAt || null
      }

      // Only refresh emailVerified, role, and account status from database if:
      // 1. Session is being manually updated (trigger === 'update'), OR
      // 2. Email is not yet verified (we need to check if it's been verified)
      // Once verified, we never need to check again
      if (trigger === 'update' && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            emailVerified: true,
            role: true,
            accountStatus: true,
            suspendedUntil: true,
            suspensionReason: true,
            banReason: true,
            warningCount: true,
            lastWarningAt: true,
          }
        })
        token.emailVerified = dbUser?.emailVerified || null
        token.role = dbUser?.role || 'USER'
        token.accountStatus = dbUser?.accountStatus || 'ACTIVE'
        token.suspendedUntil = dbUser?.suspendedUntil || null
        token.suspensionReason = dbUser?.suspensionReason || null
        token.banReason = dbUser?.banReason || null
        token.warningCount = dbUser?.warningCount || 0
        token.lastWarningAt = dbUser?.lastWarningAt || null

        if (session) {
          token = { ...token, ...session.user }
        }
      }

      return token
    },
    async session({ session, token, user }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.emailVerified = token.emailVerified as Date | null
        ;(session.user as any).role = token.role as string || 'USER'
        ;(session.user as any).accountStatus = token.accountStatus as string || 'ACTIVE'
        ;(session.user as any).suspendedUntil = token.suspendedUntil as Date | null
        ;(session.user as any).suspensionReason = token.suspensionReason as string | null
        ;(session.user as any).banReason = token.banReason as string | null
        ;(session.user as any).warningCount = token.warningCount as number || 0
        ;(session.user as any).lastWarningAt = token.lastWarningAt as Date | null
      }
      return session
    },
  },
  events: {
    async linkAccount({ user, account, profile }) {
      // Check if this is a new user (first OAuth account being linked)
      const existingAccounts = await prisma.account.count({
        where: { userId: user.id },
      })

      const isNewUser = existingAccounts === 0

      // Update user with OAuth profile data if available and mark email as verified
      if (profile?.name && !user.name) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            name: profile.name as string,
            emailVerified: new Date(),
          },
        })
      } else {
        // Always mark email as verified for OAuth users
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: new Date(),
          },
        })
      }

      // Send welcome email for new OAuth users (don't block on this)
      if (isNewUser && user.email) {
        sendWelcomeEmail(user.email, user.name || 'there')
          .catch((error) => {
            console.error('Failed to send welcome email to OAuth user:', error)
          })
      }
    },
  },
}
