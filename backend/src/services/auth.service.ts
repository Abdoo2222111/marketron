// @ts-nocheck
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokenPair, verifyRefreshToken, JwtPayload } from '../utils/jwt';
import { ApiError } from '../utils/apiError';
import { sendPasswordResetEmail } from './email.service';
import { demoDataService } from './demoData.service';
import { Prisma } from '@prisma/client';

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    company?: string;
    role?: string;
  }) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw ApiError.conflict('البريد الإلكتروني مسجل مسبقاً');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        company: data.company,
        role: (data.role as any) || 'client',
      },
    });

    // Create client profile
    await prisma.clientProfile.create({
      data: {
        userId: user.id,
        companyName: data.company,
      },
    });

    // Seed demo data in background (non-blocking)
    demoDataService.seedForUser(user.id).catch((err) => {
      console.warn('Demo data seeding skipped:', err.message);
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Login user
   */
  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw ApiError.unauthorized('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('هذا الحساب معطل. تواصل مع الدعم');
    }

    // Check password
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw ApiError.unauthorized('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.isActive) {
        throw ApiError.unauthorized('المستخدم غير موجود أو الحساب معطل');
      }

      // Generate new token pair
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return tokens;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.unauthorized('رمز التحديث غير صالح أو منتهي الصلاحية');
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientProfile: true,
        platformConnections: {
          select: {
            id: true,
            platform: true,
            platformAccountName: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw ApiError.notFound('المستخدم غير موجود');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: {
    name?: string;
    phone?: string;
    company?: string;
    avatar?: string;
  }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
        company: data.company,
        avatar: data.avatar,
      },
    });

    // Update client profile if exists
    if (data.company) {
      await prisma.clientProfile.updateMany({
        where: { userId },
        data: { companyName: data.company },
      });
    }

    return this.sanitizeUser(user);
  }

  /**
   * Connect a platform (e.g., Facebook, Instagram)
   */
  async connectPlatform(userId: string, platform: string, data: {
    accessToken: string;
    refreshToken?: string;
    platformAccountId: string;
    platformAccountName?: string;
  }) {
    // Check if already connected
    const existing = await prisma.platformConnection.findFirst({
      where: {
        userId,
        platform: platform as any,
        platformAccountId: data.platformAccountId,
      },
    });

    if (existing) {
      // Update existing connection
      return prisma.platformConnection.update({
        where: { id: existing.id },
        data: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          platformAccountName: data.platformAccountName,
          status: 'active',
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        },
      });
    }

    // Create new connection
    return prisma.platformConnection.create({
      data: {
        userId,
        platform: platform as any,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        platformAccountId: data.platformAccountId,
        platformAccountName: data.platformAccountName,
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    });
  }

  /**
   * Disconnect a platform
   */
  async disconnectPlatform(userId: string, platform: string) {
    const connection = await prisma.platformConnection.findFirst({
      where: { userId, platform: platform as any },
    });

    if (!connection) {
      throw ApiError.notFound('هذه المنصة غير مرتبطة');
    }

    await prisma.platformConnection.delete({
      where: { id: connection.id },
    });

    return { message: `تم فصل ${platform} بنجاح` };
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('المستخدم غير موجود');

    const isValid = await comparePassword(oldPassword, user.passwordHash);
    if (!isValid) throw ApiError.unauthorized('كلمة المرور الحالية غير صحيحة');

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }

  /**
   * Forgot password - generates reset token
   */
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { message: 'إذا كان البريد الإلكتروني مسجلاً، ستتلقى تعليمات إعادة تعيين كلمة المرور' };
    }

    const resetToken = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Send email (non-blocking)
    sendPasswordResetEmail(email, resetToken.accessToken);

    return {
      message: 'إذا كان البريد الإلكتروني مسجلاً، ستتلقى تعليمات إعادة تعيين كلمة المرور',
      ...(process.env.NODE_ENV === 'development' && { resetToken: resetToken.accessToken }),
    };
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = verifyRefreshToken(token);
      const passwordHash = await hashPassword(newPassword);

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { passwordHash },
      });

      return { message: 'تم إعادة تعيين كلمة المرور بنجاح' };
    } catch {
      throw ApiError.unauthorized('رمز إعادة التعيين غير صالح أو منتهي الصلاحية');
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string) {
    try {
      const decoded = verifyRefreshToken(token);

      // TODO: add isEmailVerified field to User model
      // await prisma.user.update({
      //   where: { id: decoded.userId },
      //   data: { isEmailVerified: true },
      // });

      return { message: 'تم تفعيل البريد الإلكتروني بنجاح' };
    } catch {
      throw ApiError.unauthorized('رمز التفعيل غير صالح أو منتهي الصلاحية');
    }
  }

  /**
   * Google OAuth - Login or Register with Google
   */
  async googleAuth(googleUser: { id: string; email: string; name: string; picture?: string }) {
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      // Auto-register new user from Google
      user = await prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
          avatar: googleUser.picture,
          passwordHash: `google_oauth_${googleUser.id}`,
          role: 'client',
        },
      });
      await prisma.clientProfile.create({
        data: { userId: user.id },
      });
    } else if (!user.isActive) {
      throw ApiError.forbidden('هذا الحساب معطل. تواصل مع الدعم');
    }

    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Remove sensitive fields from user object
   */
  private sanitizeUser(user: any) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}

export const authService = new AuthService();

