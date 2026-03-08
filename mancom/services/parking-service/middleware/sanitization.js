/**
 * Input Sanitization Middleware
 * Provides XSS protection and SQL injection prevention for incoming requests
 */

// Helper function to escape HTML characters (XSS prevention)
// Note: We intentionally do NOT escape @ symbol as it's crucial for email addresses
const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  return str.replace(/[&<>"'`=]/g, (char) => htmlEscapes[char]);
};

// Helper function to remove dangerous patterns (SQL injection prevention)
const sanitizeForSQL = (str) => {
  if (typeof str !== 'string') return str;
  // Remove SQL keywords and patterns
  // Note: We intentionally exclude @ symbol as it's needed for email addresses
  const sqlPatterns = [
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|EXEC|UNION|EXECUTE)\b/gi,
    /('--|;|\/\*|\*\/|@@|CHAR|NCHAR|VARCHAR|NVARCHAR)\b/gi,
    /(\x00|\x01|\x02|\x03|\x04|\x05|\x06|\x07|\x08|\x0b|\x0c|\x0e|\x0f)/g
  ];

  let sanitized = str;
  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  return sanitized;
};

// Helper function to validate and sanitize email
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return null;
  // Basic email validation with allowed domains
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return null;

  // Check for allowed domain if configured
  const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;
  if (allowedDomain && !email.endsWith(`@${allowedDomain}`)) return null;

  return email.toLowerCase().trim();
};

// Helper function to sanitize object recursively
const sanitizeObject = (obj, options = {}) => {
  if (obj === null || obj === undefined) return obj;

  const defaults = {
    escapeHtml: true,
    maxLength: 1000,
    trim: true,
    allowSpecialChars: false
  };

  const opts = { ...defaults, ...options };

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, opts));
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeValue(obj[key], opts);
      }
    }
    return sanitized;
  }

  return sanitizeValue(obj, opts);
};

// Helper function to sanitize a single value
const sanitizeValue = (value, options) => {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    // Trim whitespace first
    if (options.trim) {
      value = value.trim();
    }

    // Check if it's a Data URI (Base64 image)
    if (value.startsWith('data:image/')) {
      // Allow large Base64 strings (up to 10MB)
      if (value.length > 10 * 1024 * 1024) {
        return value.substring(0, 10 * 1024 * 1024);
      }
      return value;
    }

    // Check max length
    if (options.maxLength && value.length > options.maxLength) {
      value = value.substring(0, options.maxLength);
    }

    // Remove null bytes and control characters (except newlines and tabs)
    value = value.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');

    // Escape HTML if enabled
    if (options.escapeHtml) {
      value = escapeHtml(value);
    }

    // Sanitize for SQL if needed
    if (!options.allowSpecialChars) {
      value = sanitizeForSQL(value);
    }
  }

  return value;
};

// Middleware to sanitize request body
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body, {
      escapeHtml: true,
      maxLength: 1000,
      trim: true,
      allowSpecialChars: false
    });
  }
  next();
};

// Middleware to sanitize query parameters
const sanitizeQuery = (req, res, next) => {
  if (req.query && typeof req.query === 'object') {
    const sanitizedQuery = {};
    for (const key in req.query) {
      if (req.query.hasOwnProperty(key)) {
        sanitizedQuery[key] = sanitizeValue(req.query[key], {
          escapeHtml: true,
          maxLength: 500,
          trim: true,
          allowSpecialChars: false
        });
      }
    }
    req.query = sanitizedQuery;
  }
  next();
};

// Middleware to sanitize URL parameters
const sanitizeParams = (req, res, next) => {
  if (req.params && typeof req.params === 'object') {
    const sanitizedParams = {};
    for (const key in req.params) {
      if (req.params.hasOwnProperty(key)) {
        sanitizedParams[key] = sanitizeValue(req.params[key], {
          escapeHtml: true,
          maxLength: 100,
          trim: true,
          allowSpecialChars: false
        });
      }
    }
    req.params = sanitizedParams;
  }
  next();
};

// Middleware to sanitize all inputs (body, query, params)
const sanitizeAll = [sanitizeBody, sanitizeQuery, sanitizeParams];

// Special sanitization for specific fields that need special handling
const sanitizeSensitiveFields = (req, res, next) => {
  if (req.body) {
    // Don't sanitize passwords - they'll be hashed anyway
    // But validate their format
    if (req.body.password) {
      if (typeof req.body.password === 'string') {
        // Remove any potential malicious content but keep password chars
        req.body.password = req.body.password.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
        // Limit length to prevent DoS
        if (req.body.password.length > 128) {
          req.body.password = req.body.password.substring(0, 128);
        }
      }
    }

    // Sanitize email separately (don't escape, just validate)
    if (req.body.email) {
      const sanitizedEmail = sanitizeEmail(req.body.email);
      if (sanitizedEmail) {
        req.body.email = sanitizedEmail;
      }
    }

    // Validate and sanitize phone numbers
    if (req.body.phoneNumber) {
      if (typeof req.body.phoneNumber === 'string') {
        // Keep only digits and + for phone numbers
        req.body.phoneNumber = req.body.phoneNumber.replace(/[^\d+]/g, '');
        if (req.body.phoneNumber.length > 15) {
          req.body.phoneNumber = req.body.phoneNumber.substring(0, 15);
        }
      }
    }

    // Sanitize vehicle numbers (alphanumeric with hyphens)
    if (req.body.vehicle_number) {
      if (typeof req.body.vehicle_number === 'string') {
        req.body.vehicle_number = req.body.vehicle_number.toUpperCase().replace(/[^A-Z0-9-]/g, '');
        if (req.body.vehicle_number.length > 20) {
          req.body.vehicle_number = req.body.vehicle_number.substring(0, 20);
        }
      }
    }
  }
  next();
};

module.exports = {
  escapeHtml,
  sanitizeForSQL,
  sanitizeEmail,
  sanitizeObject,
  sanitizeValue,
  sanitizeBody,
  sanitizeQuery,
  sanitizeParams,
  sanitizeAll,
  sanitizeSensitiveFields
};

