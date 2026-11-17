"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_js_1 = require("../services/analytics.service.js");
class AnalyticsController {
    // Non-blocking visitor ping endpoint
    static async recordVisit(req, res) {
        try {
            const payload = req.body || {};
            if (!payload.visitorId) {
                payload.visitorId = `anon_${Math.random().toString(36).slice(2, 10)}`;
            }
            if (!payload.sessionId) {
                payload.sessionId = `sess_${Math.random().toString(36).slice(2, 10)}`;
            }
            // Record in background
            analytics_service_js_1.analyticsService.recordVisit(req, payload).catch((err) => {
                console.warn('[AnalyticsController] recordVisit error:', err);
            });
            res.status(200).json({ success: true });
        }
        catch (err) {
            res.status(200).json({ success: true }); // Always return 200 so analytics never interferes with client
        }
    }
    // Returns full aggregated stats for the dashboard
    static async getStats(req, res) {
        try {
            const stats = analytics_service_js_1.analyticsService.getStats();
            res.status(200).json({
                success: true,
                data: stats
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                error: err.message || 'Failed to retrieve analytics stats'
            });
        }
    }
}
exports.AnalyticsController = AnalyticsController;
