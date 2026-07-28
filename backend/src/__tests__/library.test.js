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

const libraryRoutes = require('../routes/libraryRoutes');

// --- SAHTE SUNUCU KURULUMU (Testler için Postman görevi görecek) ---
const app = express();
app.use(express.json());
app.use('/api/library', libraryRoutes);

// --- VERİTABANI VE BCRYPT MOCKLAMA (Gerçek DB'yi değil, sahtesini kullanacağız) ---
jest.mock('../config/db', () => {
    return {
        query: jest.fn() // pool.query fonksiyonunu sahtesiyle (mock) değiştiriyoruz
    };
});

// Veritabanının sahte halini testin içine alıyoruz ki ona "şöyle cevap dön" diyebilelim
const pool = require('../config/db'); 

describe('Library Controller Unit Tests', () => {
    
    // Her testten önce eski sahte verileri temizle
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // KUTUPHANEDEKI KITAPLARI LISTELEME
    describe('GET /api/library/display', () => {
        it('SHOULD DISPLAY BOOKS WITH SPECIFIED PAGE NUM ', async () => {

            // Veritabanından iki tane sahte kitap dönsün
            pool.query.mockResolvedValueOnce({
                rows: [
                    { bookID: 1, title: 'Mock Kitap 1' },
                    { bookID: 2, title: 'Mock Kitap 2' }
                ]
            });
            // postmandeki istek mantığı
            const response = await request(app).get('/api/library/display');

            // Beklentiler (Assertions)
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('books_owners');
            expect(response.body.books_owners.length).toBe(2);
        });
    });

    // KUTUPHANEYE KITAP EKLEME
    describe('POST /api/library/add', () => {
        it('ADD BOOK TO THE LIBRARY ', async () => {

            // Veritabanından iki tane sahte kitap dönsün
            pool.query.mockResolvedValueOnce({
                rows: [
                    { bookID: 3, email: 'test@vip.com' }
                ]
            });
            // postmandeki istek mantığı
            const response = await request(app)
                .post('/api/library/add')
                .send({
                    bookID: 3
                });

            // Beklentiler (Assertions)
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('added_book');
            expect(response.body.added_book[0].bookID).toBe(3);
        });
    });
    
    // KUTUPHANEDEN KITAP SILME
    describe('DELETE /api/library/remove', () => {
        it('ADD BOOK TO THE LIBRARY ', async () => {
            // TODO
        });
    });
});

