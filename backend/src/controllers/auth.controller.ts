import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { successResponse } from '../utils/apiResponse';
import { config } from '../config';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json(successResponse({
        user: result.user,
        accessToken: result.accessToken,
      }, 'تم تسجيل الحساب بنجاح'));
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json(successResponse({
        user: result.user,
        accessToken: result.accessToken,
      }, 'تم تسجيل الدخول بنجاح'));
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      if (!refreshToken) {
        res.status(401).json({ success: false, error: 'رمز التحديث مطلوب' });
        return;
      }

      const tokens = await authService.refreshToken(refreshToken);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json(successResponse({ accessToken: tokens.accessToken }));
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.userId);
      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.updateProfile(req.user!.userId, req.body);
      res.json(successResponse(user, 'تم تحديث الملف الشخصي'));
    } catch (error) {
      next(error);
    }
  }

  async connectPlatform(req: Request, res: Response, next: NextFunction) {
    try {
      const { platform } = req.params;
      const connection = await authService.connectPlatform(req.user!.userId, platform, req.body);
      res.json(successResponse(connection, `تم ربط ${platform} بنجاح`));
    } catch (error) {
      next(error);
    }
  }

  async disconnectPlatform(req: Request, res: Response, next: NextFunction) {
    try {
      const { platform } = req.params;
      const result = await authService.disconnectPlatform(req.user!.userId, platform);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: Request, res: Response) {
    res.clearCookie('refreshToken');
    res.json(successResponse(null, 'تم تسجيل الخروج بنجاح'));
  }
}

export const authController = new AuthController();
