// =============================================
// Initial Admin User Seed Script
// =============================================
// Run this script to create the initial admin user
// npx tsx src/lib/auth/seed.ts

import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting auth seed...')

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@medref.local' },
  })

  if (existingAdmin) {
    console.log('✅ Admin user already exists')
    console.log('   Email: admin@medref.local')
    console.log('   Role:', existingAdmin.role)
    return
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 12)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@medref.local',
      name: 'System Administrator',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  console.log('✅ Admin user created successfully!')
  console.log('   ID:', admin.id)
  console.log('   Email: admin@medref.local')
  console.log('   Password: Admin123!')
  console.log('')
  console.log('⚠️  IMPORTANT: Change the password immediately after first login!')

  // Create sample users for different roles
  const sampleUsers = [
    {
      email: 'doctor@medref.local',
      name: 'Dr. Sample Doctor',
      role: UserRole.DOCTOR,
    },
    {
      email: 'pharmacist@medref.local',
      name: 'Sample Pharmacist',
      role: UserRole.PHARMACIST,
    },
    {
      email: 'nurse@medref.local',
      name: 'Sample Nurse',
      role: UserRole.NURSE,
    },
    {
      email: 'student@medref.local',
      name: 'Sample Student',
      role: UserRole.STUDENT,
    },
  ]

  for (const userData of sampleUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email },
    })

    if (!existing) {
      const hashedPwd = await bcrypt.hash('Password123!', 12)
      await prisma.user.create({
        data: {
          ...userData,
          password: hashedPwd,
          isActive: true,
          emailVerified: new Date(),
        },
      })
      console.log(`✅ Created ${userData.role} user: ${userData.email}`)
    }
  }

  console.log('')
  console.log('🎉 Auth seed completed!')
  console.log('   Sample password for all users: Password123!')
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })