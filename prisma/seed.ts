// import { PrismaClient, Role, AccountProvider, UserStatus, User } from '@prisma/client';
// import bcrypt from 'bcryptjs';

// const prisma = new PrismaClient();

// interface SeedUsers {
//   adminUser: User;
//   user1: User;
//   user2: User;
//   oauthUser: User;
// }

// /**
//  * Hash password using bcrypt
//  */
// async function hashPassword(password: string): Promise<string> {
//   return bcrypt.hash(password, 12);
// }

// /**
//  * Generate a random token for password reset or email verification
//  */
// function generateToken(): string {
//   return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
// }

// /**
//  * Create test users with different roles
//  */
// async function createUsers() {
//   console.log('🔐 Creating test users...');

//   // Admin user
//   const adminUser = await prisma.user.create({
//     data: {
//       name: 'System Administrator',
//       email: 'admin@example.com',
//       password: await hashPassword('AdminPass123'),
//       role: Role.ADMIN,
//       status: UserStatus.ACTIVE,
//       emailVerified: new Date(),
//       phone: '+1234567890',
//       bio: 'System administrator with full access to all features.',
//       lastLoginAt: new Date(),
//     },
//   });

//   // Regular user 1
//   const user1 = await prisma.user.create({
//     data: {
//       name: 'John Doe',
//       email: 'john@example.com',
//       password: await hashPassword('UserPass123'),
//       role: Role.USER,
//       status: UserStatus.ACTIVE,
//       emailVerified: new Date(),
//       phone: '+1234567891',
//       bio: 'Regular user for testing purposes.',
//       lastLoginAt: new Date(),
//     },
//   });

//   // Regular user 2
//   const user2 = await prisma.user.create({
//     data: {
//       name: 'Jane Smith',
//       email: 'jane@example.com',
//       password: await hashPassword('UserPass123'),
//       role: Role.USER,
//       status: UserStatus.ACTIVE,
//       emailVerified: new Date(),
//       phone: '+1234567892',
//       bio: 'Another regular user for testing.',
//       lastLoginAt: new Date(),
//     },
//   });

//   // OAuth user (no password)
//   const oauthUser = await prisma.user.create({
//     data: {
//       name: 'OAuth User',
//       email: 'oauth@example.com',
//       password: null, // OAuth user, no password
//       role: Role.USER,
//       status: UserStatus.ACTIVE,
//       emailVerified: new Date(),
//       bio: 'User who signed up via OAuth provider.',
//       lastLoginAt: new Date(),
//     },
//   });

//   console.log(`✅ Created ${await prisma.user.count()} users`);

//   return {
//     adminUser,
//     user1,
//     user2,
//     oauthUser,
//   };
// }

// /**
//  * Create OAuth accounts for testing
//  */
// async function createAccounts(users: SeedUsers) {
//   console.log('🔗 Creating OAuth accounts...');

//   // Create Google account for OAuth user
//   await prisma.account.create({
//     data: {
//       userId: users.oauthUser.id,
//       provider: AccountProvider.GOOGLE,
//       providerAccountId: '1234567890',
//       accessToken: 'mock-access-token',
//       refreshToken: 'mock-refresh-token',
//       expiresAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
//       tokenType: 'Bearer',
//       scope: 'openid profile email',
//       idToken: 'mock-id-token',
//     },
//   });

//   // Create additional Google account for admin (testing multiple accounts)
//   await prisma.account.create({
//     data: {
//       userId: users.adminUser.id,
//       provider: AccountProvider.GOOGLE,
//       providerAccountId: '0987654321',
//       accessToken: 'mock-admin-access-token',
//       refreshToken: 'mock-admin-refresh-token',
//       expiresAt: Math.floor(Date.now() / 1000) + 3600,
//       tokenType: 'Bearer',
//       scope: 'openid profile email',
//       idToken: 'mock-admin-id-token',
//     },
//   });

//   console.log(`✅ Created ${await prisma.account.count()} OAuth accounts`);
// }

// /**
//  * Create active sessions for testing
//  */
// async function createSessions(users: SeedUsers) {
//   console.log('🎫 Creating user sessions...');

//   // Active session for admin
//   await prisma.session.create({
//     data: {
//       userId: users.adminUser.id,
//       sessionToken: 'session-token-admin-' + generateToken(),
//       expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
//       ipAddress: '192.168.1.100',
//       userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
//     },
//   });

//   // Active session for user1
//   await prisma.session.create({
//     data: {
//       userId: users.user1.id,
//       sessionToken: 'session-token-user1-' + generateToken(),
//       expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
//       ipAddress: '192.168.1.101',
//       userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
//     },
//   });

//   // Expired session for user2 (for testing cleanup)
//   await prisma.session.create({
//     data: {
//       userId: users.user2.id,
//       sessionToken: 'session-token-user2-expired-' + generateToken(),
//       expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired 1 day ago
//       ipAddress: '192.168.1.102',
//       userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
//     },
//   });

//   console.log(`✅ Created ${await prisma.session.count()} user sessions`);
// }

// /**
//  * Create password reset tokens for testing
//  */
// async function createPasswordResets(users: SeedUsers) {
//   console.log('🔑 Creating password reset tokens...');

//   // Active password reset for user2
//   await prisma.passwordReset.create({
//     data: {
//       email: users.user2.email,
//       token: 'reset-token-' + generateToken(),
//       expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
//       used: false,
//     },
//   });

//   // Used password reset token (for testing)
//   await prisma.passwordReset.create({
//     data: {
//       email: users.oauthUser.email,
//       token: 'reset-token-used-' + generateToken(),
//       expiresAt: new Date(Date.now() + 60 * 60 * 1000),
//       used: true,
//     },
//   });

//   // Expired password reset token (for testing cleanup)
//   await prisma.passwordReset.create({
//     data: {
//       email: users.user1.email,
//       token: 'reset-token-expired-' + generateToken(),
//       expiresAt: new Date(Date.now() - 60 * 60 * 1000), // Expired 1 hour ago
//       used: false,
//     },
//   });

//   console.log(`✅ Created ${await prisma.passwordReset.count()} password reset tokens`);
// }

// /**
//  * Create email verification tokens for testing
//  */
// async function createEmailVerifications(users: SeedUsers) {
//   console.log('📧 Creating email verification tokens...');

//   // Pending email verification for user1 (unverified user)
//   await prisma.emailVerification.create({
//     data: {
//       email: users.user1.email,
//       token: 'verify-token-' + generateToken(),
//       expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
//       verified: false,
//     },
//   });

//   // Used email verification token (for testing)
//   await prisma.emailVerification.create({
//     data: {
//       email: users.user1.email,
//       token: 'verify-token-used-' + generateToken(),
//       expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
//       verified: true,
//     },
//   });

//   // Expired email verification token (for testing cleanup)
//   await prisma.emailVerification.create({
//     data: {
//       email: 'expired@test.com',
//       token: 'verify-token-expired-' + generateToken(),
//       expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired 1 day ago
//       verified: false,
//     },
//   });

//   console.log(`✅ Created ${await prisma.emailVerification.count()} email verification tokens`);
// }

// /**
//  * Print summary of created data
//  */
// async function printSummary() {
//   console.log('\n📊 Database Seed Summary:');
//   console.log('========================');

//   const userCounts = await prisma.user.groupBy({
//     by: ['role', 'status'],
//     _count: true,
//   });

//   console.log('\n👥 Users by Role & Status:');
//   userCounts.forEach(({ role, status, _count }) => {
//     console.log(`   ${role} (${status}): ${_count}`);
//   });

//   console.log('\n📈 Total Records:');
//   console.log(`   Users: ${await prisma.user.count()}`);
//   console.log(`   Accounts: ${await prisma.account.count()}`);
//   console.log(`   Sessions: ${await prisma.session.count()}`);
//   console.log(`   Password Resets: ${await prisma.passwordReset.count()}`);
//   console.log(`   Email Verifications: ${await prisma.emailVerification.count()}`);

//   console.log('\n🔐 Test Login Credentials:');
//   console.log('==========================');
//   console.log('Admin: admin@example.com / AdminPass123');
//   console.log('Teacher: sarah.johnson@school.edu / TeacherPass123');
//   console.log('Teacher: michael.chen@school.edu / TeacherPass123');
//   console.log('Student: john.doe@student.edu / StudentPass123');
//   console.log('Student: jane.smith@student.edu / StudentPass123');
//   console.log('Unverified: alice.wilson@student.edu / StudentPass123');
//   console.log('Suspended: bob.brown@student.edu / StudentPass123');
//   console.log('OAuth User: emma.google@gmail.com (Google Sign-in only)');
// }

// /**
//  * Main seed function
//  */
// async function main() {
//   console.log('🌱 Starting database seed...');
//   console.log('============================');

//   try {
//     // Clear existing data (optional - comment out if you want to keep existing data)
//     console.log('🧹 Cleaning existing data...');
//     await prisma.emailVerification.deleteMany();
//     await prisma.passwordReset.deleteMany();
//     await prisma.session.deleteMany();
//     await prisma.account.deleteMany();
//     await prisma.user.deleteMany();
//     console.log('✅ Existing data cleaned');

//     // Create all seed data
//     const users = await createUsers();
//     await createAccounts(users);
//     await createSessions(users);
//     await createPasswordResets(users);
//     await createEmailVerifications(users);

//     await printSummary();

//     console.log('\n🎉 Database seeded successfully!');
//   } catch (error) {
//     console.error('❌ Error seeding database:', error);
//     throw error;
//   }
// }

// /**
//  * Cleanup function
//  */
// async function cleanup() {
//   await prisma.$disconnect();
// }

// // Execute the seed
// main()
//   .then(cleanup)
//   .catch(async (error) => {
//     console.error('❌ Seed failed:', error);
//     await cleanup();
//     process.exit(1);
//   });
