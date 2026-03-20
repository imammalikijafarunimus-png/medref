// =============================================
// User Registration API
// =============================================
// Public registration for new users (default role: GUEST)

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { createAuditLog, extractClientInfo } from '@/lib/auth/audit'

// Registration schema
const registerSchema = z.object({
  email: z.string().email('Email tidak valid').min(1, 'Email wajib diisi'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Password harus mengandung angka'),
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const clientInfo = extractClientInfo(request.headers)

    // Validate input
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Data tidak valid',
          details: validation.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      )
    }

    const { email, password, name } = validation.data

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      await createAuditLog({
        action: 'LOGIN_FAILED',
        entity: 'User',
        details: {
          email,
          reason: 'Email already registered',
        },
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      })

      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: 'GUEST', // Default role for new users
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    // Audit log
    await createAuditLog({
      action: 'CREATE',
      entity: 'User',
      entityId: user.id,
      userId: user.id,
      details: {
        email: user.email,
        name: user.name,
        role: user.role,
        registrationMethod: 'credentials',
      },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        message: 'Registrasi berhasil. Silakan login.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)

    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    )
  }
}