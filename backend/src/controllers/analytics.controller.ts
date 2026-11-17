import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { VisitPayload } from '../types/analytics.types.js';

export class AnalyticsController {
  // Non-blocking visitor ping endpoint
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
    } catch (err: any) {
      res.status(200).json({ success: true }); // Always return 200 so analytics never interferes with client
    }
  }

  // Returns full aggregated stats for the dashboard
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
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
