const pool = require('../config/db');
const { GoogleGenAI } = require('@google/genai');

// Gemini'yi anahtarımızla başlatıyoruz
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getAIRecommendations = async (req, res) => {
    try {
        const email = req.user.email; // Güvenlik görevlisinden gelen kullanıcı bilgisi

        // 1. KULLANICIYI TANIYALIM (Veritabanından sevdiği kitapları çekelim)
        // Burada 4 ve 5 yıldız verdiği kitapların isimlerini ve kategorilerini alıyoruz
        const userFavoritesQuery = `
            SELECT b.title, b.category, b.author 
            FROM "Review" r
            JOIN "Book" b ON r.has = b."bookID"
            WHERE r.writes = $1 AND r.rating >= 4
            LIMIT 5
        `;
        const favoritesData = await pool.query(userFavoritesQuery, [email]);
        const favorites = favoritesData.rows;

        if (favorites.length === 0) {
            return res.status(400).json({ error: "Sana öneri yapabilmem için önce birkaç kitaba (4-5 yıldız) puan vermelisin!" });
        }

        // 2. KULLANICI PROFİLİNİ METNE DÖK
        const favoriteListText = favorites.map(f => `${f.title} (${f.author} - ${f.category})`).join(', ');

        // 3. YAPAY ZEKAYA TALİMAT (PROMPT) VER
        // Dikkat: JSON formatında dönmesi için onu zorluyoruz!
        const prompt = `
            Sen uzman bir kütüphanecisin.
            Kullanıcının daha önce okuyup çok sevdiği kitaplar şunlar: ${favoriteListText}.
            
            Bu kullanıcının zevkine uygun, daha önce okumadığı 3 yeni kitap öner.
            Cevabını SADECE aşağıdaki JSON formatında ver, başka hiçbir metin (markdown vb.) ekleme:
            [
                {
                    "title": "Kitap Adı",
                    "author": "Yazar Adı",
                    "reason": "Neden önerdin? (Türkçe, kısa ve samimi bir açıklama)"
                }
            ]
        `;

        // 4. GEMINI'YE İSTEK AT
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: {
                // responseMimeType: "application/json", // İleride daha katı JSON kontrolü için açabiliriz
            }
        });

        // 5. GELEN CEVABI TEMİZLE VE JSON'A ÇEVİR
        let aiText = response.text;
        // Bazen AI kod bloğu (```json) içinde döner, onu temizliyoruz
        aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const recommendations = JSON.parse(aiText);

        res.status(200).json({
            message: "Yapay zeka önerileri başarıyla alındı",
            recommendations: recommendations
        });

    } catch (error) {
        console.error("AI Hatası:", error);
        res.status(500).json({ error: "Yapay zeka şu an biraz yorgun, sonra tekrar dene." });
    }
};

module.exports = { getAIRecommendations };