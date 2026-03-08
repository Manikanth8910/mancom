const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { prisma } = require('@mancom/database');

// Constants
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error("CRITICAL: JWT_SECRET environment variable is missing in production!");
  process.exit(1);
}

const FALLBACK_SECRET = 'vnr-parking-local-dev-fallback';
const SECRET_TO_USE = JWT_SECRET || FALLBACK_SECRET;
const TOKEN_EXPIRY = '7d';
const COOKIE_NAME = 'auth_token';

let PUBLIC_KEY;
try {
  PUBLIC_KEY = fs.readFileSync(path.join(__dirname, '../../../keys/public.pem'), 'utf8');
} catch (e) {
  if (process.env.NODE_ENV === 'production') {
    console.warn("PUBLIC_KEY not found in production. Falling back to symmetric HS256.");
  }
  PUBLIC_KEY = SECRET_TO_USE;
}

/**
 * Safe JWT decoding function
 */
const safeDecodeJwt = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Invalid token format' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token structure' };
    }

    const payload = parts[1];
    const decoded = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);

    // Check expiration
    if (parsed.exp && parsed.exp < Date.now() / 1000) {
      return { valid: false, error: 'Token expired', expired: true };
    }

    return { valid: true, decoded: parsed };
  } catch (error) {
    return { valid: false, error: 'Failed to decode token' };
  }
};

/**
 * Generate JWT token (HS256)
 */
const generateToken = (payload) => {
  return jwt.sign(payload, SECRET_TO_USE, { expiresIn: TOKEN_EXPIRY });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    let decoded;
    try {
      // Try RS256 first (tokens from mancom auth-service)
      // Accept audience 'mancom-services' and issuer 'mancom-auth'
      decoded = jwt.verify(token, PUBLIC_KEY, {
        algorithms: ['RS256'],
        audience: 'mancom-services',
        issuer: 'mancom-auth',
      });
    } catch (rsErr) {
      // Fallback to HS256 (legacy/dev tokens)
      try {
        decoded = jwt.verify(token, SECRET_TO_USE, { algorithms: ['HS256'] });
      } catch (hsErr) {
        console.error('[Auth] Both RS256 and HS256 verification failed:', rsErr.message, '|', hsErr.message);
        throw hsErr;
      }
    }

    // Map Mancom roles array to expected format
    if (decoded.roles && Array.isArray(decoded.roles)) {
      decoded.role = decoded.roles.includes('admin') || decoded.roles.includes('superadmin') ? 'superadmin' :
        decoded.roles.includes('security') ? 'security' : 'user';
    }

    if (!decoded.email && decoded.sub) decoded.email = 'unknown@mancom.app';
    if (!decoded.id && decoded.sub) decoded.id = decoded.sub;

    return { valid: true, decoded };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'Token expired', expired: true };
    }
    return { valid: false, error: 'Invalid token' };
  }
};

/**
 * Extract token from header or cookie
 */
const extractToken = (req) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }
  return null;
};

/**
 * Ensure user exists in the PostgreSQL database
 * In a true unified system, auth-service would have already created this.
 */
const ensureUserExists = async (user) => {
  try {
    const { id, email, name, role, phone } = user;
    if (!email) return;

    // Check if user exists by email or ID
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: id }, { email: email }]
      }
    });

    if (!dbUser) {
      // Create user if not found (fallback)
      dbUser = await prisma.user.create({
        data: {
          id: id.length > 36 ? undefined : id, // Only use if it looks like a UUID
          email: email,
          name: name || 'Mancom User',
          role: role || 'resident', // Map correctly if needed
          phone: phone || null
        }
      });
    }

    // Update the request user ID to the actual DB ID if they differ
    user.id = dbUser.id;
  } catch (error) {
    console.error("Error ensuring user exists in PostgreSQL:", error.message);
  }
};

/**
 * Middleware: Authenticate Token
 */
const authenticateToken = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const result = verifyToken(token);
  if (!result.valid) {
    return res.status(403).json({ error: result.error });
  }

  req.user = result.decoded;
  req.token = token;

  await ensureUserExists(req.user);
  next();
};

/**
 * Middleware: Optional Authentication
 */
const optionalAuth = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();

  const result = verifyToken(token);
  if (result.valid) {
    req.user = result.decoded;
    req.token = token;
    await ensureUserExists(req.user);
  }
  next();
};

/**
 * Middleware: Authorize Admin
 */
const authorizeAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * Middleware: Authorize Role
 */
const authorizeRole = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];

  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    let hasPermission = false;
    if (req.user.role === 'superadmin') return next();

    if (roles.includes(req.user.role)) hasPermission = true;
    if (!hasPermission && req.user.user_type && roles.includes(req.user.user_type)) hasPermission = true;

    if (!hasPermission) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

/**
 * Helper: Set Cookie
 */
const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
};

/**
 * Helper: Clear Cookie
 */
const clearAuthCookie = (res) => {
  res.cookie(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  });
};

module.exports = {
  authenticateToken,
  authorizeAdmin,
  authorizeRole,
  optionalAuth,
  generateToken,
  verifyToken,
  safeDecodeJwt,
  extractToken,
  setAuthCookie,
  clearAuthCookie,
  COOKIE_NAME,
  SECRET_TO_USE,
  TOKEN_EXPIRY
};
