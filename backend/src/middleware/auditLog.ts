import prisma from '../config/database';
import logger from '../utils/logger';

export interface AuditEntry {
  userId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export const createAuditLog = async (entry: AuditEntry): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        details: JSON.stringify(entry.details || {}),
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    });
  } catch (error) {
    logger.error('Failed to create audit log', { error });
  }
};

export const audit = (action: string) => {
  return async (req: any, _res: any, next: any): Promise<void> => {
    const originalJson = _res.json.bind(_res);
    _res.json = function (body: any) {
      if (_res.statusCode < 400) {
        createAuditLog({
          userId: req.user?.userId,
          action,
          resource: req.originalUrl,
          resourceId: req.params?.id || req.body?.id,
          details: {
            method: req.method,
            statusCode: _res.statusCode,
            params: req.params,
            query: req.query,
          },
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'],
        }).catch(() => {});
      }
      return originalJson(body);
    };
    next();
  };
};

