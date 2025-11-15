const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5001', // Changed from 5000 to avoid macOS AirPlay conflict
      changeOrigin: true,
    })
  );
};

