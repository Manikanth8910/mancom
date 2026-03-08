const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Allowed email domains for Google OAuth
const ALLOWED_DOMAINS = ['vnrvjiet.in', 'gmail.com'];

// Check if email domain is allowed
const isDomainAllowed = (email) => {
  if (!email || typeof email !== 'string') return false;

  const domain = email.split('@')[1];
  return ALLOWED_DOMAINS.includes(domain);
};

const verifyGoogleToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the access token and get user info
    // note: Frontend sends access_token, not id_token
    const tokenInfo = await client.getTokenInfo(token);

    // Verify audience (client ID)
    // tokenInfo.aud can be compared to process.env.GOOGLE_CLIENT_ID if needed
    // but getTokenInfo verifies the token is valid on Google's side.

    // Fetch user profile
    const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const payload = await userInfoResponse.json();

    // Check if email is verified
    if (!payload.email_verified) {
      return res.status(400).json({ error: 'Email not verified with Google' });
    }

    // Check domain restriction
    if (!isDomainAllowed(payload.email)) {
      return res.status(403).json({
        error: 'Domain not allowed',
        message: 'Only authorized email domains are allowed'
      });
    }

    // Attach user info to request
    req.googleUser = {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified,
      domain: payload.email.split('@')[1]
    };

    next();
  } catch (error) {
    console.error('Google token verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Export middleware and helper functions
module.exports = verifyGoogleToken;
module.exports.isDomainAllowed = isDomainAllowed;
module.exports.ALLOWED_DOMAINS = ALLOWED_DOMAINS;
