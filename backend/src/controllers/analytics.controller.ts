import { Request, Response } from 'express';
import { analyticsService, verifyAdminPassword } from '../services/analytics.service.js';
import { VisitPayload } from '../types/analytics.types.js';

export class AnalyticsController {
  // Non-blocking visitor ping endpoint (public, anonymous)
  static async recordVisit(req: Request, res: Response): Promise<void> {
    try {
      const payload: VisitPayload = req.body || {};
      if (!payload.visitorId) {
        payload.visitorId = `anon_${Math.random().toString(36).slice(2, 10)}`;
      }
      if (!payload.sessionId) {
        payload.sessionId = `sess_${Math.random().toString(36).slice(2, 10)}`;
      }

      // Record in background
      analyticsService.recordVisit(req, payload).catch((err) => {
        console.warn('[AnalyticsController] recordVisit error:', err);
      });

      res.status(200).json({ success: true });
    } catch {
      res.status(200).json({ success: true }); // Always return 200 so analytics never interferes with client
    }
  }

  // Verifies admin password
  static async verifyPassword(req: Request, res: Response): Promise<void> {
    const { password } = req.body || {};
    if (verifyAdminPassword(password)) {
      res.status(200).json({ success: true, token: password });
    } else {
      res.status(401).json({ success: false, error: 'Incorrect administrator password' });
    }
  }

  // Returns full aggregated stats for the dashboard (PASSWORD PROTECTED)
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers['authorization'];
      const rawHeaderKey = req.headers['x-admin-key'];
      const key =
        (typeof rawHeaderKey === 'string' ? rawHeaderKey : '') ||
        (typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '') : '') ||
        (typeof req.query.key === 'string' ? req.query.key : '');

      if (!verifyAdminPassword(key)) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized: Admin password required to access analytics'
        });
        return;
      }

      const stats = analyticsService.getStats();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to retrieve analytics stats'
      });
    }
  }
}
