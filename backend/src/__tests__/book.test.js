const request = require('supertest');
const express = require('express');

// middleware olan verifTokeni de mockladık
jest.mock('../middlewares/verifyToken', () => {
    return (req, res, next) => {
        // Token kontrolü yapmıyoruz! Direkt sahte bir kullanıcı (req.user) yaratıyoruz.
        req.user = { email: 'test@vip.com' }; 
        next(); // Geçebilirsin!
    };
});

const mainRoutes = require('../routes/mainRoutes');

// --- SAHTE SUNUCU KURULUMU (Testler için Postman görevi görecek) ---
const app = express();
app.use(express.json());
app.use('/api/main', mainRoutes);

// --- VERİTABANI VE BCRYPT MOCKLAMA (Gerçek DB'yi değil, sahtesini kullanacağız) ---
jest.mock('../config/db', () => {
    return {
        query: jest.fn() // pool.query fonksiyonunu sahtesiyle (mock) değiştiriyoruz
    };
});

// Veritabanının sahte halini testin içine alıyoruz ki ona "şöyle cevap dön" diyebilelim
const pool = require('../config/db'); 

describe('Book Controller Unit Tests', () => {
    
    // Her testten önce eski sahte verileri temizle
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ANASAYFADA KITAPLARI GORUNTULEME
    describe('GET /api/main/main-books', () => {
        it('SHOULD DISPLAY BOOKS WITH SPECIFIED PAGE NUM ', async () => {

            // Veritabanından dört tane sahte kitap dönsün
            pool.query.mockResolvedValueOnce({
                rows: [
                    { bookID: 1, title: 'Mock Kitap 1' },
                    { bookID: 2, title: 'Mock Kitap 2' },
                    { bookID: 3, title: 'Mock Kitap 3' },
                    { bookID: 4, title: 'Mock Kitap 4' }
                ]
            });

            // 2. MOCK: Toplam sayıyı (COUNT) getiren ikinci pool.query için (KRİTİK DÜZELTME)
            pool.query.mockResolvedValueOnce({
                rows: [
                    { count: '4' } // 4 kitap olduğunu söylüyoruz
                ]
            });

            // postmandeki istek mantığı
            const response = await request(app).get('/api/main/main-books?page=1&search=&category=');

            // Beklentiler (Assertions)
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('books');
            expect(response.body.books.length).toBe(4);
        });
    });

    // ANASAYFADA SECILEN KATEGORIYE GORE KITAPLARI GORUNTULEME
    describe('GET /api/main/categories', () => {
        it('SHOULD DISPLAY BOOKS WITH SPECIFIED CATEGORIES ', async () => {

            // Veritabanından dört tane sahte kitap dönsün
            pool.query.mockResolvedValueOnce({
                rows: [
                    { category: 'Sci-fi' },
                    { category: 'Adventure' },
                    { category: 'Sports' }
                ]
            });

            // postmandeki istek mantığı
            const response = await request(app).get('/api/main/categories');

            // Beklentiler (Assertions)
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('categories');
            expect(response.body.categories.length).toBe(3);
        });
    });

});

