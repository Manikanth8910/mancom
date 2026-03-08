const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

// LEVEL 1: Neural Blacklist
const blacklist = new Set();
const threatScores = new Map();

// Configuration
const WAF_PATTERNS = {
    SQLI: /(UNION\s+SELECT|DROP\s+TABLE|INSERT\s+INTO|1=1|OR\s+1=1|'--|;|\/\*|\*\/|@@|CHAR|VARCHAR|SLEEP|BENCHMARK)/i,
    XSS: /(<script>|javascript:|onerror=|onload=|onclick=|onmouseover=|<img\s+src=|<svg\s+onload=|eval\(|setTimeout\(|setInterval\(|alert\(|document\.cookie|window\.location)/i,
    TRAVERSAL: /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c|%2e%2e\/|\/\.env|\/\.git|\/etc\/passwd|\/etc\/shadow)/i,
    NOSQL: /(\$ne|\$gt|\$lt|\$in|\$nin|\$exists|\$where)/i
};

const COMMON_SCANNERS = /nmap|nikto|sqlmap|zenmap|wget|python-requests|gobuster|dirb/i;

const HONEYPOT_PATHS = ['/.env', '/.git', '/admin_backup', '/api/debug', '/wp-admin', '/phpmyadmin'];

// LEVEL 1: Neural Blacklist Middleware
const neuralBlacklistMiddleware = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    if (blacklist.has(ip)) {
        return res.status(403).json({ error: 'Connection dropped. IP blacklisted by Parking Sentinel.' });
    }
    next();
};

// LEVEL 1: Web Application Firewall (WAF)
const wafMiddleware = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();

    // Block Scanners
    if (COMMON_SCANNERS.test(userAgent) && !userAgent.includes('mancom') && !userAgent.includes('reactnative')) {
        blacklist.add(ip);
        return res.status(403).json({ error: 'Scanner detected and blocked.' });
    }

    // Check URL & Query for payloads
    const checkPayload = (payload) => {
        if (typeof payload === 'string') {
            return Object.values(WAF_PATTERNS).some(pattern => pattern.test(payload));
        }
        if (typeof payload === 'object' && payload !== null) {
            return Object.values(payload).some(val => checkPayload(val));
        }
        return false;
    };

    if (checkPayload(req.url) || checkPayload(req.query) || checkPayload(req.body)) {
        blacklist.add(ip);
        console.warn(`[PARKING SENTINEL] WAF blocked IP: ${ip} for malicious payload in ${req.method} ${req.url}`);
        return res.status(403).json({ error: 'Malicious payload detected by WAF.' });
    }

    next();
};

// LEVEL 2: Parking Sentinel - Honey-Pot Traps
const honeyPotMiddleware = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const path = req.path;

    if (HONEYPOT_PATHS.includes(path)) {
        blacklist.add(ip);
        console.warn(`[PARKING SENTINEL] Threat neutralized. IP: ${ip} accessed honeypot: ${path}`);
        return res.status(403).json({ error: 'Access Denied. Your IP has been logged and banned.' });
    }
    next();
};

// LEVEL 2: Threat Intelligence Engine
const threatIntelligenceEngine = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;

    // Simple scoring mechanism based on rapid requests
    const scoreData = threatScores.get(ip) || { hits: 0, lastHit: Date.now(), score: 0 };
    const now = Date.now();

    // If hitting too fast (sub 100ms), increase score
    if (now - scoreData.lastHit < 100) {
        scoreData.score += 5;
    } else {
        // Decay score slowly
        scoreData.score = Math.max(0, scoreData.score - 1);
    }

    scoreData.hits += 1;
    scoreData.lastHit = now;
    threatScores.set(ip, scoreData);

    // Auto-ban if score exceeds 100%
    if (scoreData.score > 100) {
        blacklist.add(ip);
        console.warn(`[PARKING SENTINEL] Threat Intelligence banned IP: ${ip}. Threat Score exceeded threshold.`);
        return res.status(403).json({ error: 'Threat Score exceeds safe limits. Access restricted.' });
    }

    next();
};

// LEVEL 1: Dynamic Rate Limiting (The Security Switcher)
const getSecurityModeLimit = (req, res) => {
    const mode = (process.env.SECURITY_MODE || 'balanced').toLowerCase();
    switch (mode) {
        case 'relaxed': return 50;
        case 'paranoid': return 10;
        case 'balanced':
        default: return 30;
    }
};

const dynamicRateLimiter = rateLimit({
    windowMs: 1000, // 1 second window
    max: getSecurityModeLimit, // Dynamic evaluation per request
    message: 'Rate limit exceeded based on active security mode.',
    standardHeaders: true,
    legacyHeaders: false,
});

// LEVEL 3: Payment Signature Verification (HMAC-SHA256)
const verifyRazorpaySignature = (orderId, paymentId, signature, secret) => {
    const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(orderId + "|" + paymentId)
        .digest('hex');
    return generatedSignature === signature;
};

// LEVEL 4: DataCipher (AES-256) Object 
const DataCipher = {
    encrypt: (text, encryptionKey) => {
        // Requires a 32-byte hex key in production
        const key = crypto.scryptSync(encryptionKey || process.env.ENCRYPTION_KEY || 'default_secret', 'salt', 32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    },
    decrypt: (encryptedText, encryptionKey) => {
        try {
            const [ivHex, encrypted] = encryptedText.split(':');
            const key = crypto.scryptSync(encryptionKey || process.env.ENCRYPTION_KEY || 'default_secret', 'salt', 32);
            const iv = Buffer.from(ivHex, 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (err) {
            return null;
        }
    }
};

// LEVEL 3: Neural Password Gate (Express implementation of Basic Auth challenge)
const neuralPasswordGate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // Let's protect specific Neural directories if they somehow pass express routes, e.g., /admin
    if (!authHeader || authHeader.indexOf('Basic ') === -1) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Neural Password Gate"');
        return res.status(401).json({ error: 'Authentication required' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
        next();
    } else {
        blacklist.add(req.ip || req.connection.remoteAddress); // Ban on failed attempt
        return res.status(403).json({ error: 'Invalid credentials. IP blacklisted.' });
    }
};

// LEVEL 2: Worker Stress Monitoring (Event Loop Lag)
// Tracks Node.js event loop lag as a surrogate for individual process monitoring
let lastLoop = Date.now();
let currentLag = 0;
setInterval(() => {
    const now = Date.now();
    currentLag = now - lastLoop - 500; // 500ms is the interval
    lastLoop = now;
}, 500);

const workerStressMonitor = (req, res, next) => {
    if (currentLag > 1000) { // If lag > 1s, the worker is under stress
        console.warn(`[PARKING SENTINEL] Worker stress detected. Event loop lag: ${currentLag}ms. Possible resource exhaustion attack.`);
    }
    next();
};

module.exports = {
    neuralBlacklistMiddleware,
    wafMiddleware,
    honeyPotMiddleware,
    threatIntelligenceEngine,
    dynamicRateLimiter,
    verifyRazorpaySignature,
    DataCipher,
    neuralPasswordGate,
    workerStressMonitor
};
