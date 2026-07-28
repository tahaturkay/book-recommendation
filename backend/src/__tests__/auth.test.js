const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/authRoutes');
process.env.JWT_SECRET = 'test-icin-sahte-gizli-anahtar';
// --- SAHTE SUNUCU KURULUMU (Testler için Postman görevi görecek) ---
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// --- VERİTABANI VE BCRYPT MOCKLAMA (Gerçek DB'yi değil, sahtesini kullanacağız) ---
jest.mock('../config/db', () => {
    return {
        query: jest.fn() // pool.query fonksiyonunu sahtesiyle (mock) değiştiriyoruz
    };
});

// Veritabanının sahte halini testin içine alıyoruz ki ona "şöyle cevap dön" diyebilelim
const pool = require('../config/db'); 

describe('Auth Controller Unit Tests', () => {
    
    // Her testten önce eski sahte verileri temizle
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // 1. GÖREV: BAŞARILI KAYIT OLMA (REGISTER)
    describe('POST /api/auth/register', () => {
        it('should register a new user and return 201 status', async () => {
            
            // Senaryo 1: Veritabanında bu kullanıcı yok (Email benzersiz)
            pool.query.mockResolvedValueOnce({ rowCount: 0 }); // İlk sorgu (Kullanıcı var mı?) 0 dönsün
            
            // Senaryo 2: Veritabanına kayıt işlemi başarılı oldu
            pool.query.mockResolvedValueOnce({ 
                rows: [{ userID: 1, username: 'testuser', email: 'test@test.com' }] 
            });

            // Postman gibi istek atıyoruz
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@test.com',
                    password: 'password123'
                });

            // Beklentilerimiz (Assertions)
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message');
        });

        it('should return error if email already exists', async () => {
            
            // Senaryo: Veritabanı "Bu mail var" diye dolu bir cevap döndü
            pool.query.mockResolvedValueOnce({ rowCount: 1 }); 

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser2',
                    email: 'test@test.com', // Aynı email
                    password: 'password123'
                });

            // Beklentimiz: Sistemin 400 (veya 409) dönmesi
            expect(response.status).toBe(400); 
        });
    });

    // 2. GÖREV: BAŞARILI GİRİŞ YAPMA (LOGIN)
    describe('POST /api/auth/login', () => {
        it('should login user and return a JWT token', async () => {
            
            // bcrypt.compare işlemini atlamak için, şifre doğruymuş gibi davranmasını sağlayalım
            const bcrypt = require('bcrypt');
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

            // Veritabanı sahte kullanıcımızı bulup döndürsün
            pool.query.mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ userID: 1, email: 'test@test.com', password: 'hashedpassword' }]
            });

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@test.com',
                    password: 'correctpassword'
                });

            // Beklentilerimiz
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('generatedToken');
        });

        it('KULLANICI YOKSA TESTI', async () => {
            // 1. ADIM (Mock): Veritabanında kullanıcı yokmuş gibi davran
            // pool.query'nin "rowCount: 0" döneceği bir mock yazabilir misin?
            pool.query.mockResolvedValueOnce({ rowCount: 0 });

            // 2. ADIM (İstek): Olmayan bir e-posta ile giriş yapmayı dene
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'hayalet@test.com',
                    password: 'password123'
                });

            expect(response.status).toBe(404);
        });

        it('SIFRE YANLIS TESTI', async () => {
            // 1. ADIM (Mock): Veritabanında kullanıcı var ama şifre YANLIŞ!
            // pool.query kullanıcıyı bulsun (rowCount: 1)
            pool.query.mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ userID: 1, email: 'test@test.com', password: 'hashedpassword' }]
            });

            // 2. ADIM (Mock): bcrypt.compare bu sefer "false" dönsün!
            const bcrypt = require('bcrypt');
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

            // 3. ADIM (İstek): Yanlış şifre ile istek at
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@test.com',
                    password: 'yanlissifre'
                });

            expect(response.status).toBe(401);
        });

    });

    
});