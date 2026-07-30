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

const reviewRoutes = require('../routes/reviewRoutes');

// --- SAHTE SUNUCU KURULUMU (Testler için Postman görevi görecek) ---
const app = express();
app.use(express.json());
app.use('/api/reviews', reviewRoutes);

// --- VERİTABANI VE BCRYPT MOCKLAMA (Gerçek DB'yi değil, sahtesini kullanacağız) ---
jest.mock('../config/db', () => {
    return {
        query: jest.fn() // pool.query fonksiyonunu sahtesiyle (mock) değiştiriyoruz
    };
});

// Veritabanının sahte halini testin içine alıyoruz ki ona "şöyle cevap dön" diyebilelim
const pool = require('../config/db'); 


describe('Review Controller Unit Tests', () => {
    
    // Her testten önce eski sahte verileri temizle
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // REVIEW EKLEME
    describe('POST /api/reviews/add-reviews', () => {
        it('SHOULD ADD NEW REVIEW', async () => {

            pool.query.mockResolvedValueOnce({
                rows: [
                    { has: 1040 , writes: "test@vip.com", rating: 3, comment: "basima bisey gelirse google paly sotr sorumldr"}
                ]
            });

            pool.query.mockResolvedValueOnce({
                rows: [
                    { rating: 4.12, numRating: 58 }
                ]
            });

            pool.query.mockResolvedValueOnce({
                rows: [
                    { bookID: 1040, rating: 4.09, numRating: 59 }
                ]
            });

            // postmandeki istek mantığı
            const response = await request(app).post('/api/reviews/add-reviews/1040').send({ rating: 3, comment: "Harika" });;

            // Beklentiler (Assertions)
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('reviewed_book');
            expect(response.body.reviewed_book.length).toBe(1);
            expect(pool.query).toHaveBeenCalledTimes(3);
        });
    });

    // REVIEWLARI GORUNTULEMEK
    describe('GET /api/reviews/get-reviews', () => {
        it('SHOULD DISPLAY REVIEWS ', async () => {

            // Veritabanından iki tane sahte kitap dönsün
            pool.query.mockResolvedValueOnce({
                rows: [
                    { comment: "fena degil" , rating: 3, username: "fazil", reviewID: 2, writes: "test@vip.com", has: 5423},
                ]
            });

            // postmandeki istek mantığı
            const response = await request(app).get('/api/reviews/get-reviews/5423');

            // Beklentiler (Assertions)
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('get_reviews');
            expect(response.body.get_reviews.length).toBe(1);
        });
    });

    
    
    // REVIEW SILME
    describe('DELETE /api/reviews/delete-reviews', () => {
        it('DELETE BOOK FROM LIBRARY ', async () => {

            pool.query.mockResolvedValueOnce({
                rowCount: 1,
                rows: [
                    { rating: 3, has: 3402 }
                ]
            });

            pool.query.mockResolvedValueOnce({
                // bu dataları aslında kullanmıyorum sonrasında buna bağlı olarak ama dursun
                rows: [
                    { reviewID: 4, comment: "güzel gidiyor akıcı baya", rating: 5 }
                ]
            });

            pool.query.mockResolvedValueOnce({
                rows: [
                    { rating: 3.4, numRating: 750938 }
                ]
            });

            pool.query.mockResolvedValueOnce({
                rows: [] // UPDATE işlemi genelde rows dönmez, boş bırakabiliriz
            });

            // postmandeki istek mantığı
            const response = await request(app).delete('/api/reviews/delete-reviews/4');

            // Beklentiler (Assertions)
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('deleted_review');
            expect(response.body.deleted_review[0].reviewID).toBe(4);

            expect(pool.query).toHaveBeenCalledTimes(4); // 4 kere mock db çağırılmış mı test ediyoruz
        });
    });

    // REVIEW UPDATELEME
    describe('PUT /api/reviews/update-reviews', () => {
        it('SHOULD UPDATE REVIEW', async () => {

            pool.query.mockResolvedValueOnce({
                rowCount: 1,
                rows: [
                    { has: 6161 , rating: 3 }
                ]
            });

            pool.query.mockResolvedValueOnce({
                rows: [
                    { rating: 3.89, numRating: 13 }
                ]
            });

            pool.query.mockResolvedValueOnce({
                rows: [
                    { bookID: 6161, rating: 4.42, numRating: 13 }
                ]
            });

            pool.query.mockResolvedValueOnce({
                rows: [
                    { reviewID: 4, rating: 5, comment: "muhteşem olmuş"}
                ]
            });

            // postmandeki istek mantığı
            const response = await request(app).put('/api/reviews/update-reviews/4').send({ rating: 5, comment: "muhteşem olmuş" });;

            // Beklentiler (Assertions)
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('updated_review');
            expect(response.body.updated_review.length).toBe(1);
            expect(pool.query).toHaveBeenCalledTimes(3);
        });
    });
});

