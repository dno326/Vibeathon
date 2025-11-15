const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5001', // Changed from 5000 to avoid macOS AirPlay conflict
      changeOrigin: true,
      // When Express matches '/api', it strips the prefix from req.path
      // So '/api/auth/login' becomes '/auth/login' in the middleware
      // We need to add '/api' back to the path when forwarding to backend
      pathRewrite: function (path, req) {
        // req.path will be '/auth/login' after Express matches '/api'
        // We need to add '/api' back: '/api' + path
        return '/api' + path;
      },
      logLevel: 'debug', // Enable logging for debugging
    })
  );
};

