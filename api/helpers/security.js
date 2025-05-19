const crypto = require('crypto');

const encrypt = (text, key) => {
    try{
        const iv = crypto.randomBytes(12); // 12 bytes for GCM
        const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        return iv.toString('hex') + ':' + encrypted + ':' + authTag.toString('hex');
    }catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
}

const decrypt = (cipherText, key) => {
    try{
        const parts = cipherText.split(':');
        const iv = Buffer.from(parts.shift(), 'hex');
        const encryptedText = parts.shift();
        const authTag = Buffer.from(parts.shift(), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

const generateKey = () => {
    return crypto.randomBytes(32).toString('hex');
}
const generateIV = () => {
    return crypto.randomBytes(16).toString('hex');
}
const generateSalt = () => {
    return crypto.randomBytes(16).toString('hex');
}
const combine = (text) => {
    const key = generateKey();
    const iv = generateIV();
    const salt = generateSalt();
    const cypherText = encrypt(text, key);
    return key + '_' + iv + '_' + cypherText + '_' + salt;
}

const getKey = (text) => {
    const parts = text.split('_');
    return parts[0];
}

const getCypherText = (text) => {
    const parts = text.split('_');
    return parts[2];
}

module.exports = {
    encrypt,
    decrypt,
    combine,
    getKey,
    getCypherText
}
