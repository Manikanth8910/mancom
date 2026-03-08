/**
 * CSRF Protection Middleware
 * Provides protection against Cross-Site Request Forgery attacks
 */

const crypto = require('crypto');

// In-memory store for CSRF tokens (use Redis in production)
const csrfTokenStore = new Map();

// Generate a secure random token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Clean up expired tokens (call this periodically)
const cleanupExpiredTokens = () => {
  const now = Date.now();
  for (const [token, data] of csrfTokenStore.entries()) {
    if (now > data.expiresAt) {
      csrfTokenStore.delete(token);
    }
  }
};

// Set up periodic cleanup (every hour)
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

// Generate CSRF token for a session/user
const generateCsrfToken = (userId) => {
  const token = generateToken();
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  csrfTokenStore.set(token, {
    userId,
    createdAt: Date.now(),
    expiresAt
  });
  
  return token;
};

// Verify CSRF token
const verifyCsrfToken = (token, userId) => {
  if (!token) return false;
  
  const data = csrfTokenStore.get(token);
  if (!data) return false;
  
  // Check if token has expired
  if (Date.now() > data.expiresAt) {
    csrfTokenStore.delete(token);
    return false;
  }
  
  // Verify user ID matches (if provided)
  if (userId && data.userId !== userId) return false;
  
  return true;
};

// Middleware to generate and attach CSRF token to response
const csrfTokenMiddleware = (req, res, next) => {
  // Generate token for authenticated users
  if (req.user && req.user.id) {
    const token = generateCsrfToken(req.user.id);
    
    // Attach token to response locals for view/template access
    res.locals.csrfToken = token;
    
    // Set CSRF token as a cookie (httpOnly for security)
    res.cookie('csrf_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });
    
    // Also send token in header for AJAX requests
    res.setHeader('X-CSRF-Token', token);
  }
  
  next();
};

// Middleware to validate CSRF token on state-changing requests
const validateCsrfMiddleware = (req, res, next) => {
  // Skip CSRF validation for safe methods and routes
  const skipMethods = ['GET', 'HEAD', 'OPTIONS'];
  const skipRoutes = ['/api/health', '/api/auth/send-email-verification', '/api/auth/send-phone-verification'];
  
  if (skipMethods.includes(req.method)) {
    return next();
  }
  
  if (skipRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }
  
  // Get token from header or cookie
  const tokenFromHeader = req.headers['x-csrf-token'];
  const tokenFromCookie = req.cookies && req.cookies.csrf_token;
  
  const token = tokenFromHeader || tokenFromCookie;
  
  if (!token) {
    return res.status(403).json({ 
      error: 'CSRF token missing',
      message: 'Security verification failed. Please refresh the page and try again.'
    });
  }
  
  // Verify token
  const userId = req.user && req.user.id;
  if (!verifyCsrfToken(token, userId)) {
    return res.status(403).json({ 
      error: 'Invalid CSRF token',
      message: 'Security verification failed. Please refresh the page and try again.'
    });
  }
  
  // Regenerate token after successful validation (token rotation)
  if (req.user && req.user.id) {
    // Remove old token
    csrfTokenStore.delete(token);
    // Generate new token
    const newToken = generateCsrfToken(req.user.id);
    res.cookie('csrf_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });
    res.setHeader('X-CSRF-Token', newToken);
  }
  
  next();
};

// Double Submit Cookie pattern (alternative implementation)
const doubleSubmitCsrf = {
  // Generate matching cookies and token
  generateDoubleSubmit: (res) => {
    const csrfToken = generateToken();
    const csrfCookie = crypto.createHash('sha256').update(csrfToken).digest('hex');
    
    // Set both tokens
    res.cookie('csrf_token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });
    
    res.cookie('csrf_cookie', csrfCookie, {
      httpOnly: false, // Can be read by JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });
    
    return csrfToken;
  },
  
  // Verify double submit tokens
  verifyDoubleSubmit: (req) => {
    const token = req.cookies && req.cookies.csrf_token;
    const cookie = req.cookies && req.cookies.csrf_cookie;
    
    if (!token || !cookie) return false;
    
    // Verify cookie matches token
    const expectedCookie = crypto.createHash('sha256').update(token).digest('hex');
    return cookie === expectedCookie;
  }
};

// Export middleware functions
module.exports = {
  generateCsrfToken,
  verifyCsrfToken,
  csrfTokenMiddleware,
  validateCsrfMiddleware,
  doubleSubmitCsrf
};

