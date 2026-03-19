import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "app/lib/db";
import { env } from "app/lib/env";
import { LoginSchema } from "app/sections/auth/data/schemas";
import { logAuth, logSecurity } from "app/utils/log";
import bcrypt from "bcryptjs";
import { Role, UserStatus } from "db/enums";

/**
 * NextAuth configuration options
 */
export const authOptions: NextAuthOptions = {
  // Session strategy - using JWT without adapter
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 60 * 60, // 1 hour — refresh token more frequently
  },

  // Custom pages
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  // Authentication providers
  providers: [
    // Google OAuth provider
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
      // Profile callback - used to map Google profile data to our user model
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: Role.USER,
          status: UserStatus.ACTIVE,
          emailVerified: new Date(), // OAuth emails are pre-verified
        };
      },
    }),

    // Credentials provider for manual login
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { 
          label: "Email", 
          type: "email", 
          placeholder: "john@example.com" 
        },
        password: { 
          label: "Password", 
          type: "password" 
        },
      },
      async authorize(credentials, req) {
        try {
          // Validate input
          if (!credentials?.email || !credentials?.password) {
            logSecurity('LOGIN_ATTEMPT_MISSING_CREDENTIALS', 'low', {
              email: credentials?.email || 'unknown',
              ip: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'],
            });
            return null;
          }

          // Validate credentials format
          const validatedCredentials = LoginSchema.safeParse({
            email: credentials.email,
            password: credentials.password,
          });

          if (!validatedCredentials.success) {
            logSecurity('LOGIN_ATTEMPT_INVALID_FORMAT', 'low', {
              email: credentials.email,
              errors: validatedCredentials.error.issues,
            });
            return null;
          }

          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email: validatedCredentials.data.email },
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
              role: true,
              status: true,
              emailVerified: true,
              avatar: true,
            },
          });

          // Check if user exists
          if (!user) {
            logAuth('LOGIN_FAILED', undefined, {
              email: validatedCredentials.data.email,
              reason: 'user_not_found',
              ip: req.headers?.['x-forwarded-for'],
            });
            return null;
          }

          // Check if user has a password (not OAuth-only)
          if (!user.password) {
            logAuth('LOGIN_FAILED', user.id, {
              email: user.email,
              reason: 'oauth_only_account',
            });
            return null;
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            validatedCredentials.data.password,
            user.password
          );

          if (!isValidPassword) {
            logAuth('LOGIN_FAILED', user.id, {
              email: user.email,
              reason: 'invalid_password',
            });
            logSecurity('FAILED_LOGIN_ATTEMPT', 'medium', {
              userId: user.id,
              email: user.email,
              ip: req.headers?.['x-forwarded-for'],
            });
            return null;
          }

          // Check user status
          if (user.status === UserStatus.SUSPENDED) {
            logAuth('LOGIN_FAILED', user.id, {
              email: user.email,
              reason: 'account_suspended',
            });
            return null;
          }

          if (user.status === UserStatus.INACTIVE) {
            logAuth('LOGIN_FAILED', user.id, {
              email: user.email,
              reason: 'account_inactive',
            });
            return null;
          }

          if (user.status === UserStatus.PENDING_VERIFICATION) {
            logAuth('LOGIN_FAILED', user.id, {
              email: user.email,
              reason: 'email_not_verified',
            });
            return null;
          }

          // Update last login time
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          // Log successful login
          logAuth('LOGIN_SUCCESS', user.id, {
            email: user.email,
            role: user.role,
            loginMethod: 'credentials',
          });

          // Return user object for session
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified,
            image: user.avatar,
          };
        } catch (error) {
          console.error("NextAuth authorize error:", error);
          logSecurity('LOGIN_SYSTEM_ERROR', 'high', {
            error: error instanceof Error ? error.message : 'Unknown error',
            email: credentials?.email,
          });
          return null;
        }
      },
    }),
  ],

  // Callbacks
  callbacks: {
    // JWT callback - runs whenever JWT is accessed
    async jwt({ token, user, account, profile, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.emailVerified = user.emailVerified;
        token.refreshedAt = Date.now();
        
        // Log the authentication method
        if (account?.provider) {
          logAuth('TOKEN_CREATED', user.id, {
            provider: account.provider,
            type: account.type,
          });
        }
      }

      // Handle account updates
      if (trigger === "update" && session) {
        token.name = session.name;
        token.email = session.email;
        token.picture = session.image;
      }

      // Periodic refresh: re-fetch user data from DB every hour
      const REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour in ms
      const lastRefreshed = (token.refreshedAt as number) || 0;
      if (Date.now() - lastRefreshed > REFRESH_INTERVAL && token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, status: true, emailVerified: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.status = dbUser.status;
            token.emailVerified = dbUser.emailVerified;
            token.refreshedAt = Date.now();
          }
        } catch (error) {
          // Silently fail — use cached token data
          console.error('JWT refresh from DB failed:', error);
        }
      }

      return token;
    },

    // Session callback - runs whenever session is accessed
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
        session.user.emailVerified = token.emailVerified as Date | null;
      }

      return session;
    },

    // Sign in callback - control if sign in is allowed
    async signIn({ user, account, profile, email, credentials }) {
      try {
        // Handle OAuth sign ins without adapter
        if (account?.provider !== "credentials") {
          // Handle OAuth user creation/update manually
          if (account?.provider === "google" && profile) {
            try {
              // Check if user already exists
              const existingUser = await prisma.user.findUnique({
                where: { email: user.email! },
              });

              if (!existingUser) {
                // Create new user from OAuth
                const newUser = await prisma.user.create({
                  data: {
                    name: user.name!,
                    email: user.email!,
                    avatar: user.image,
                    role: Role.USER,
                    status: UserStatus.ACTIVE,
                    emailVerified: new Date(), // OAuth emails are pre-verified
                  },
                });

                // Update user object with database ID
                user.id = newUser.id;

                logAuth('OAUTH_USER_CREATED', newUser.id, {
                  provider: account.provider,
                  email: user.email,
                });
              } else {
                // Update user object with existing ID
                user.id = existingUser.id;
                user.role = existingUser.role;
                user.status = existingUser.status;
                user.emailVerified = existingUser.emailVerified;

                // Update last login time
                await prisma.user.update({
                  where: { id: existingUser.id },
                  data: { lastLoginAt: new Date() },
                });
              }

              logAuth('OAUTH_LOGIN_SUCCESS', user.id, {
                provider: account.provider,
                email: user.email,
              });
            } catch (dbError) {
              console.error("Database error during OAuth sign in:", dbError);
              logSecurity('OAUTH_DATABASE_ERROR', 'high', {
                error: dbError instanceof Error ? dbError.message : 'Unknown error',
                provider: account.provider,
                email: user.email,
              });
              return false;
            }
          }
          return true;
        }

        // For credentials, the authorize function already handled validation
        return true;
      } catch (error) {
        console.error("NextAuth signIn callback error:", error);
        logSecurity('SIGNIN_CALLBACK_ERROR', 'high', {
          error: error instanceof Error ? error.message : 'Unknown error',
          provider: account?.provider,
          email: user.email,
        });
        return false;
      }
    },

    // Redirect callback - control where users go after auth
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      
      return baseUrl;
    },
  },

  // Events
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      logAuth('SIGNIN_EVENT', user.id, {
        provider: account?.provider,
        isNewUser,
        email: user.email,
      });
    },
    
    async signOut({ token }) {
      logAuth('SIGNOUT_EVENT', token?.id as string, {
        email: token?.email,
      });
    },
    
    async createUser({ user }) {
      logAuth('USER_CREATED_EVENT', user.id, {
        email: user.email,
        name: user.name,
      });
    },
  },

  // Debug mode in development
  debug: process.env.NODE_ENV === "development",
};

/**
 * NextAuth handler
 */
export const NextAuthHandler = NextAuth(authOptions);

/**
 * Get server session with type safety
 */
export const getAuthSession = () => getServerSession(authOptions);

/**
 * Export getServerSession for convenience
 */
export { getServerSession };
