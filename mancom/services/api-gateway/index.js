const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Proxy routes
const routes = {
    '/auth': 'http://127.0.0.1:3001',
    '/societies': 'http://127.0.0.1:3001',
    '/users': 'http://127.0.0.1:3001',
    '/visitors': 'http://127.0.0.1:3001',
    '/payments': 'http://127.0.0.1:3003',
    '/helpdesk': 'http://127.0.0.1:3004',
    '/api/vehicles': 'http://127.0.0.1:3005',
    '/api/parking': 'http://127.0.0.1:3005',
    '/api/qr': 'http://127.0.0.1:3005',
};

for (const [route, target] of Object.entries(routes)) {
    app.use(route, createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: (path, req) => path, // keep the route prefix, the microservices expect it
    }));
}

// Global Me route since Profile uses /profile in frontend but we mapped to /auth/me or profile service could happen.
// Actually frontend uses /profile
app.use('/profile', createProxyMiddleware({
    target: 'http://127.0.0.1:3001',
    changeOrigin: true,
    pathRewrite: { '^/profile': '/auth/me' },
}));

app.get('/health', (req, res) => {
    res.send({ status: 'ok', service: 'api-gateway' });
});

app.listen(PORT, () => {
    console.log(`API Gateway running on http://127.0.0.1:${PORT}`);
});
