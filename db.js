const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/supermarket_db';

let client;
let db;

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'supermarketapp123456789012345678901';
const IV_LENGTH = 16;

function encrypt(text) {
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Şifre çözme hatası:', error);
        return null;
    }
}

function encryptJSON(data) {
    return encrypt(JSON.stringify(data));
}

function decryptJSON(encryptedData) {
    const decryptedText = decrypt(encryptedData);
    if (!decryptedText) return null;
    try {
        return JSON.parse(decryptedText);
    } catch (error) {
        console.error('JSON parse hatası:', error);
        return null;
    }
}

async function connect() {
    if (db) return db;
    
    try {
        client = new MongoClient(uri, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
        
        await client.connect();
        console.log('MongoDB bağlantısı başarılı');
        
        db = client.db();
        return db;
    } catch (err) {
        console.error('MongoDB bağlantı hatası:', err);
        throw err;
    }
}

async function registerUser(userData) {
    try {
        const db = await connect();
        const users = db.collection('users');
        
        const existingUser = await users.findOne({ email: userData.email });
        if (existingUser) {
            return {
                success: false,
                message: 'Bu e-posta adresi zaten kullanılıyor'
            };
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        const encryptedName = encrypt(userData.name);
        const encryptedEmail = encrypt(userData.email);
        
        const newUser = {
            name: encryptedName,
            email: encryptedEmail,
            password: hashedPassword,
            createdAt: new Date()
        };
        
        const result = await users.insertOne(newUser);
        
        const { password, ...userWithoutPassword } = newUser;
        const decryptedUser = {
            ...userWithoutPassword,
            name: userData.name,
            email: userData.email
        };
        
        return {
            success: true,
            user: decryptedUser
        };
    } catch (err) {
        console.error('Kullanıcı kaydı hatası:', err);
        return {
            success: false,
            message: 'Veritabanı hatası'
        };
    }
}

async function loginUser(email, password) {
    try {
        const db = await connect();
        const users = db.collection('users');
        
        const allUsers = await users.find({}).toArray();
        
        let user = null;
        for (const u of allUsers) {
            try {
                const decryptedEmail = decrypt(u.email);
                if (decryptedEmail === email) {
                    user = u;
                    break;
                }
            } catch (e) {
                console.error('E-posta çözme hatası:', e);
            }
        }
        
        if (!user) {
            return {
                success: false,
                message: 'Kullanıcı bulunamadı'
            };
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return {
                success: false,
                message: 'Geçersiz şifre'
            };
        }
        
        const decryptedName = decrypt(user.name);
        const decryptedEmail = decrypt(user.email);
        
        const { password: _, ...userWithoutPassword } = user;
        const decryptedUser = {
            ...userWithoutPassword,
            name: decryptedName,
            email: decryptedEmail
        };
        
        return {
            success: true,
            user: decryptedUser
        };
    } catch (err) {
        console.error('Giriş hatası:', err);
        return {
            success: false,
            message: 'Veritabanı hatası'
        };
    }
}

async function saveFavorites(userId, favorites) {
    try {
        const db = await connect();
        const userFavorites = db.collection('user_favorites');
        
        const encryptedFavorites = encryptJSON(favorites);
        
        const result = await userFavorites.updateOne(
            { userId },
            { $set: { favorites: encryptedFavorites, updatedAt: new Date() } },
            { upsert: true }
        );
        
        return {
            success: true
        };
    } catch (err) {
        console.error('Favori kaydetme hatası:', err);
        return {
            success: false,
            message: 'Veritabanı hatası'
        };
    }
}

async function getFavorites(userId) {
    try {
        const db = await connect();
        const userFavorites = db.collection('user_favorites');
        
        const doc = await userFavorites.findOne({ userId });
        
        if (!doc) {
            return {
                success: true,
                favorites: []
            };
        }
        
        const decryptedFavorites = doc.favorites ? decryptJSON(doc.favorites) : [];
        
        return {
            success: true,
            favorites: decryptedFavorites || []
        };
    } catch (err) {
        console.error('Favori getirme hatası:', err);
        return {
            success: false,
            message: 'Veritabanı hatası'
        };
    }
}

async function close() {
    if (client) {
        await client.close();
        console.log('MongoDB bağlantısı kapatıldı');
    }
}

module.exports = {
    connect,
    registerUser,
    loginUser,
    saveFavorites,
    getFavorites,
    close
};


class MongoDBClient {
    constructor(baseURL = 'http://localhost:3000/api') {
        this.baseURL = baseURL;
        this.encryptionKey = localStorage.getItem('encryption_key') || this.generateEncryptionKey();
    }
    
    generateEncryptionKey() {
        const key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        localStorage.setItem('encryption_key', key);
        return key;
    }
    
    async encrypt(text) {
        const encodedText = new TextEncoder().encode(text);
        const key = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(this.encryptionKey),
            { name: 'AES-GCM' },
            false,
            ['encrypt']
        );
        
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encodedText
        );
        
        return {
            iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
            data: Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join('')
        };
    }
    
    async decrypt(encryptedObj) {
        const key = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(this.encryptionKey),
            { name: 'AES-GCM' },
            false,
            ['decrypt']
        );
        
        const iv = new Uint8Array(encryptedObj.iv.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const encryptedData = new Uint8Array(encryptedObj.data.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            encryptedData
        );
        
        return new TextDecoder().decode(decrypted);
    }
    
    async encryptJSON(data) {
        const jsonString = JSON.stringify(data);
        return await this.encrypt(jsonString);
    }
    
    async decryptJSON(encryptedData) {
        try {
            const decryptedText = await this.decrypt(encryptedData);
            return JSON.parse(decryptedText);
        } catch (error) {
            console.error('JSON çözme hatası:', error);
            return null;
        }
    }

    async registerUser(userData) {
        try {
            const encryptedName = await this.encrypt(userData.name);
            const encryptedEmail = await this.encrypt(userData.email);
            
            const encryptedUserData = {
                name: encryptedName,
                email: encryptedEmail,
                password: userData.password
            };
            
            const response = await fetch(`${this.baseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(encryptedUserData)
            });

            return await response.json();
        } catch (err) {
            console.error('Kullanıcı kaydı hatası:', err);
            return {
                success: false,
                message: 'API bağlantı hatası'
            };
        }
    }

    async loginUser(email, password) {
        try {
            const encryptedEmail = await this.encrypt(email);
            
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: encryptedEmail, 
                    password: password
                })
            });

            return await response.json();
        } catch (err) {
            console.error('Giriş hatası:', err);
            return {
                success: false,
                message: 'API bağlantı hatası'
            };
        }
    }

    async saveFavorites(userId, favorites) {
        try {
            const encryptedFavorites = await this.encryptJSON(favorites);
            
            const response = await fetch(`${this.baseURL}/favorites/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ favorites: encryptedFavorites })
            });

            return await response.json();
        } catch (err) {
            console.error('Favori kaydetme hatası:', err);
            return {
                success: false,
                message: 'API bağlantı hatası'
            };
        }
    }

    async getFavorites(userId) {
        try {
            const response = await fetch(`${this.baseURL}/favorites/${userId}`);
            const result = await response.json();
            
            if (result.success && result.favorites) {
                try {
                    const decryptedFavorites = await this.decryptJSON(result.favorites);
                    return {
                        success: true,
                        favorites: decryptedFavorites || []
                    };
                } catch (error) {
                    console.error('Favori çözme hatası:', error);
                    return {
                        success: false,
                        message: 'Veri çözülemedi'
                    };
                }
            }
            
            return result;
        } catch (err) {
            console.error('Favori getirme hatası:', err);
            return {
                success: false,
                message: 'API bağlantı hatası'
            };
        }
    }
}

const dbClient = new MongoDBClient();

window.SupermarketDB = dbClient; 