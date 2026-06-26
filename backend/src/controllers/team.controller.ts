import { Request, Response, NextFunction } from 'express';
import { teamService } from '../services/team.service';
import { successResponse } from '../utils/apiResponse';

export class TeamController {
  async getTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await teamService.getTeam(req.user!.userId);
      res.json(successResponse(team));
    } catch (error) {
      next(error);
    }
  }

  async invite(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, role } = req.body;
      if (!email) {
        res.status(400).json({ success: false, error: 'البريد الإلكتروني مطلوب' });
        return;
      }
      const member = await teamService.invite(req.user!.userId, { email, role });
      res.status(201).json(successResponse(member, 'تم إرسال الدعوة'));
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await teamService.removeMember(req.user!.userId, req.params.id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.body;
      if (!role) {
        res.status(400).json({ success: false, error: 'الصلاحية مطلوبة' });
        return;
      }
      const member = await teamService.updateMemberRole(req.user!.userId, req.params.id, role);
      res.json(successResponse(member, 'تم تحديث الصلاحية'));
    } catch (error) {
      next(error);
    }
  }
}

export const teamController = new TeamController();
