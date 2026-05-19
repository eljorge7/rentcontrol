const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
require('dotenv').config();

const prisma = new PrismaClient();
const prefix = 'enc:v1:';
const algorithm = 'aes-256-gcm';

function getSecretKey() {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) return '';
    if (key.length !== 32) return crypto.createHash('sha256').update(String(key)).digest('base64').substring(0, 32);
    return key;
}

function encrypt(text) {
    if (!text) return text;
    if (text.startsWith(prefix)) return text;
    const key = getSecretKey();
    if (!key) return text;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'utf8'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${prefix}${iv.toString('hex')}:${authTag}:${encrypted}`;
}

async function run() {
    console.log('Migrando Routers Mikrotik en RentControl...');
    const routers = await prisma.mikrotikRouter.findMany();
    let count = 0;
    for (const r of routers) {
        let updated = false;
        const data = {};
        if (r.password && !r.password.startsWith(prefix)) { data.password = encrypt(r.password); updated = true; }
        if (r.vpnPassword && !r.vpnPassword.startsWith(prefix)) { data.vpnPassword = encrypt(r.vpnPassword); updated = true; }
        
        if (updated) {
            await prisma.mikrotikRouter.update({ where: { id: r.id }, data });
            count++;
        }
    }
    console.log(`Migrados ${count} routers en RentControl.`);
}

run().finally(() => prisma.$disconnect());
