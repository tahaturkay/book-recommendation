const cron = require('node-cron');
const pool = require('../config/db');

// Her gece saat 03:00'te çalışacak görev (0 3 * * *)
const startPopularityCron = () => {
    cron.schedule('0 3 * *', async () => {
        console.log("🌙 [CRON] Gece 03:00 - Popülerlik Skorları hesaplanıyor...");
        const startTime = Date.now();

        try {
            
            // SİHİRLİ SQL SORGUSU (Özel "Power Law" Algoritması)
            // Kural: 4 yıldızlı 500 oylu kitap = 5 yıldızlı 100 oylu kitap
            const updateQuery = `
                UPDATE "Book"
                SET popularity_score = (rating * POWER("numRatings", 0.118647))
                WHERE "numRatings" > 0;
            `;
            await pool.query(updateQuery);

            const endTime = Date.now();
            console.log(`✅ [CRON] Tüm kitapların popülerlik skorları güncellendi! (Süre: ${(endTime - startTime)} ms)`);

        } catch (error) {
            console.error("❌ [CRON] Popülerlik skorları hesaplanırken hata oluştu:", error);
        }
    });

    console.log("⏱️  Cron Job aktif: Kitap popülerlik skorları her gece 03:00'te güncellenecek.");
};

module.exports = startPopularityCron;