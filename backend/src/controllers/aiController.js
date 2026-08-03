const pool = require('../config/db');
const { GoogleGenAI } = require('@google/genai');

// Gemini'yi anahtarımızla başlatıyoruz
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getAIRecommendations = async (req, res) => {
    try {
        const email = req.user.email; 

        // ====================================================================
        // ADIM 1: KULLANICIYI TANI (Context Gathering)
        // ====================================================================
        const userFavoritesQuery = `
            SELECT b."bookID", b.title, b.category, b.author 
            FROM "Review" r
            JOIN "Book" b ON r.has = b."bookID"
            WHERE r.writes = $1 AND r.rating >= 4
        `;
        const favoritesData = await pool.query(userFavoritesQuery, [email]);
        const favorites = favoritesData.rows;

        if (favorites.length === 0) {
            return res.status(400).json({ error: "Sana öneri yapabilmem için önce birkaç kitaba (4-5 yıldız) puan vermelisin!" });
        }

        // Kullanıcının sevdiği kategorileri, yazarları ve zaten okuduğu kitapların ID'lerini ayıklıyoruz
        const readBookIds = favorites.map(f => f.bookID);
        const favoriteCategories = [...new Set(favorites.map(f => f.category).filter(Boolean))];
        const favoriteAuthors = [...new Set(favorites.map(f => f.author).filter(Boolean))];
        const favoriteListText = favorites.map(f => f.title).join(', ');


        // ====================================================================
        // ADIM 2: R (RETRIEVAL) - KENDİ VERİTABANIMIZDAN KİTAP ÇEKME
        // ====================================================================
        // Kullanıcının sevebileceği tarzda, ama DAHA ÖNCE OKUMADIĞI 30 kitabı DB'den çekiyoruz
        const catalogQuery = `
            SELECT "bookID", title, author, category 
            FROM "Book"
            WHERE (category = ANY($1::text[]) OR author = ANY($2::text[]))
            AND NOT ("bookID" = ANY($3::int[]))
            LIMIT 100
        `;
        const catalogData = await pool.query(catalogQuery, [favoriteCategories, favoriteAuthors, readBookIds]);
        const catalogBooks = catalogData.rows;

        if (catalogBooks.length === 0) {
            return res.status(404).json({ error: "Kütüphanemizde zevkine uygun yeni bir kitap bulamadık." });
        }


        // ====================================================================
        // ADIM 3: A (AUGMENTED) - PROMPT'U ZENGİNLEŞTİRME
        // ====================================================================
        // Çektiğimiz 30 kitabı yapay zekanın okuyabileceği bir "Katalog" metnine çeviriyoruz
        const catalogText = catalogBooks.map(b => `- ID: ${b.bookID} | Kitap: ${b.title} | Yazar: ${b.author} | Kategori: ${b.category}`).join('\n');

        const prompt = `
            Sen uzman bir sahaf kütüphanecisisin.
            Kullanıcının daha önce okuyup çok sevdiği kitaplar şunlar: ${favoriteListText}.
            
            DİKKAT: Kullanıcıya SADECE VE SADECE aşağıdaki "Katalog" listesinde bulunan kitaplardan 30 tane yeni öneri yapabilirsin. 
            Katalog dışında kafandan ASLA kitap uydurma!
            
            --- Katalog Başlangıcı ---
            ${catalogText}
            --- Katalog Sonu ---
            
            Katalogu incele ve kullanıcının zevkine en uygun 30 kitabı seç.
            Cevabını SADECE aşağıdaki JSON formatında ver, başka hiçbir metin ekleme:
            [
                {
                    "bookID": Seçtiğin kitabın ID numarası (Sayı olarak),
                    "title": "Kitap Adı",
                    "author": "Yazar Adı",
                    "reason": "Bu kitabı neden önerdin? (Kullanıcının sevdiği kitaplara atıfta bulunarak kısa ve samimi bir açıklama)"
                }
            ]
        `;


        // ====================================================================
        // ADIM 4: G (GENERATION) - YAPAY ZEKAYA CEVAPLATMA
        // ====================================================================
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash', // Sende çalışan modeli yazabilirsin (örn: gemini-3.5-flash)
            contents: prompt,
        });

        let aiText = response.text; 
        aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const recommendations = JSON.parse(aiText);

        // YENİ EKLENEN KISIM BAŞLANGICI: AI'ın seçtiği kitapların tüm detaylarını DB'den çekiyoruz
        const recommendedBookIds = recommendations.map(r => r.bookID);
        
        // Bu 3 kitabın kapak resmi, yayın yılı vb. tüm özelliklerini alıyoruz
        const finalBooksQuery = `SELECT * FROM "Book" WHERE "bookID" = ANY($1::int[])`;
        const finalBooksData = await pool.query(finalBooksQuery, [recommendedBookIds]);
        
        let finalBooks = finalBooksData.rows;

        // Frontend'in (BookShelf) hata vermemesi için değişken adını "recommendedBooks" yapıyoruz
        res.status(200).json({
            message: "Sahafın özel önerileri hazır!",
            recommendedBooks: finalBooks, 
            hasMore: false // AI tek seferlik 3 tane ürettiği için pagination'ı kapatıyoruz
        });

    } catch (error) {
        console.error("AI RAG Hatası:", error);
        res.status(500).json({ error: "Yapay zeka öneri motoru şu an meşgul." });
    }
};

module.exports = { getAIRecommendations };