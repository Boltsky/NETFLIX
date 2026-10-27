"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const api_routes_js_1 = __importDefault(require("./routes/api.routes.js"));
function createApp() {
    const app = (0, express_1.default)();
    // Middleware
    app.use((0, cors_1.default)({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));
    app.use(express_1.default.json());
    // Mount API
    app.use('/api/v1', api_routes_js_1.default);
    // Fallback root health check
    app.get('/', (req, res) => {
        res.json({
            name: 'CineWave TV Backend API',
            status: 'active',
            docs: '/api/v1/health'
        });
    });
    return app;
}
