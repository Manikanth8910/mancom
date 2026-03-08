const crypto = require('crypto');

// Use a consistent secret key for deterministic encryption (searchable)
// In production, this should be a 32-byte distinct key in .env
const SECRET_KEY = crypto.createHash('sha256').update(process.env.JWT_SECRET || 'vnr-parking-secret-key').digest();
const ALGORITHM = 'aes-256-cbc';
// Fixed IV for deterministic encryption (allows searching by encrypted email)
// In a highly sensitive app, you'd use random IV and a separate hash column for search.
// For this pilot, fixed IV allows us to query "WHERE email = ?" easily.
const FIXED_IV = crypto.createHash('md5').update('fixed-iv-for-search').digest();

const encrypt = (text) => {
    if (!text) return text;
    try {
        const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, FIXED_IV);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    } catch (error) {
        console.error('Encryption error details:', error.message);
        console.error('Key length:', SECRET_KEY.length);
        console.error('IV length:', FIXED_IV.length);
        return text;
    }
};

const decrypt = (text) => {
    if (!text) return text;
    try {
        const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, FIXED_IV);
        let decrypted = decipher.update(text, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        // If decryption fails (e.g. legacy plain text), return original
        return text;
    }
};

module.exports = { encrypt, decrypt };
