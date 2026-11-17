"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_js_1 = require("../services/analytics.service.js");
class AnalyticsController {
    // Helper to extract admin key from headers or query
    static extractAdminKey(req) {
        const authHeader = req.headers['authorization'];
        const rawHeaderKey = req.headers['x-admin-key'];
        return ((typeof rawHeaderKey === 'string' ? rawHeaderKey : '') ||
            (typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '') : '') ||
            (typeof req.query.key === 'string' ? req.query.key : ''));
    }
    // Non-blocking visitor ping endpoint (public, anonymous)
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
        catch {
            res.status(200).json({ success: true }); // Always return 200 so analytics never interferes with client
        }
    }
    // Verifies admin password
    static async verifyPassword(req, res) {
        const { password } = req.body || {};
        if ((0, analytics_service_js_1.verifyAdminPassword)(password)) {
            res.status(200).json({ success: true, token: password });
        }
        else {
            res.status(401).json({ success: false, error: 'Incorrect administrator password' });
        }
    }
    // Returns full aggregated stats for the dashboard (PASSWORD PROTECTED)
    static async getStats(req, res) {
        try {
            const key = AnalyticsController.extractAdminKey(req);
            if (!(0, analytics_service_js_1.verifyAdminPassword)(key)) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized: Admin password required to access analytics'
                });
                return;
            }
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
    // Returns administrator account info (email, username, lastUpdated - no password returned)
    static async getAccount(req, res) {
        try {
            const key = AnalyticsController.extractAdminKey(req);
            if (!(0, analytics_service_js_1.verifyAdminPassword)(key)) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized: Admin password required'
                });
                return;
            }
            const account = analytics_service_js_1.analyticsService.getAdminAccountConfig();
            res.status(200).json({
                success: true,
                data: {
                    email: account.email,
                    username: account.username,
                    lastUpdated: account.lastUpdated
                }
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                error: err.message || 'Failed to retrieve account details'
            });
        }
    }
    // Updates administrator account settings (email, username, password)
    static async updateAccount(req, res) {
        try {
            const key = AnalyticsController.extractAdminKey(req);
            if (!(0, analytics_service_js_1.verifyAdminPassword)(key)) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized: Admin password required'
                });
                return;
            }
            const result = analytics_service_js_1.analyticsService.updateAdminAccount(req.body || {});
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    error: result.error || 'Failed to update admin account'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Administrator account successfully updated',
                token: result.token,
                data: result.account
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                error: err.message || 'Failed to update administrator account'
            });
        }
    }
}
exports.AnalyticsController = AnalyticsController;
