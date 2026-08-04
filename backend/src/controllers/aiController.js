const pool = require('../config/db');
//const { GoogleGenAI } = require('@google/genai'); GEMINI İÇİN
const Groq = require('groq-sdk'); // YENİ: Groq kütüphanesini dahil ettik   


//const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); Gemini'yi anahtarımızla başlatıyoruz
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
            AND NOT ("bookID" = ANY($3::int[])) ORDER BY "Book"."popularity_score" DESC
            LIMIT 30
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
        const catalogText = catalogBooks.map(b => `- ID: ${b.bookID} | Kitap: ${b.title} | Yazar: ${b.author} | Skor: ${b.popularity_score} | Kategori: ${b.category}`).join('\n');

        const prompt = `
            Sen uzman bir sahaf kütüphanecisisin.
            Kullanıcının daha önce okuyup çok sevdiği kitaplar şunlar: ${favoriteListText}.
            
            DİKKAT: Kullanıcıya SADECE VE SADECE aşağıdaki "Katalog" listesinde bulunan kitaplardan 10 tane yeni öneri yapabilirsin. 
            Katalog dışında kafandan ASLA kitap uydurma!
            
            --- Katalog Başlangıcı ---
            ${catalogText}
            --- Katalog Sonu ---
            
            Katalogu incele ve kullanıcının zevkine en uygun 10 kitabı seç.
            Seçilen kitapları popularity_score'ları artandan azalana doğru sırala
            Cevabını SADECE aşağıdaki JSON formatında ver, başka hiçbir metin ekleme:
            [
                {
                    "bookID": Seçtiğin kitabın ID numarası (Sayı olarak),
                    "title": "Kitap Adı",
                    "author": "Yazar Adı",
                    "popularity_score": "kitabın popülerlik skoru",
                    "reason": "Bu kitabı neden önerdin? (Kullanıcının sevdiği kitaplara atıfta bulunarak kısa ve samimi bir açıklama)"
                }
            ]
        `;


        // ====================================================================
        // ADIM 4: G (GENERATION) - YAPAY ZEKAYA CEVAPLATMA
        // ====================================================================
        const startTime = Date.now();

        // 4. GROQ'A GÖNDER VE CEVABI AL (Llama 3.3 70B modeli)
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile", // Groq'un en güncel ve en güçlü modellerinden biri
            temperature: 0.5,
        });

       // 5. GELEN CEVABI TEMİZLE VE JSON'A ÇEVİR
        let aiText = response.choices[0]?.message?.content || "";
        aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();

        const recommendations = JSON.parse(aiText);

        // KRONOMETREYİ DURDUR
        const endTime = Date.now();
        // Milisaniyeyi saniyeye çevirip virgülden sonra 2 hane alıyoruz (Örn: 2.45)
        const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);
        // Terminale havalı bir şekilde yazdıralım
        console.log(`⏱️ Groq Llama 3 Yanıt Süresi: ${durationInSeconds} saniye`);


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
            hasMore: false, // AI tek seferlik 3 tane ürettiği için pagination'ı kapatıyoruz
            aiDuration: `${durationInSeconds} saniye`
        });

    } catch (error) {
        console.error("AI RAG Hatası:", error);
        res.status(500).json({ error: "Yapay zeka öneri motoru şu an meşgul." });
    }
};

module.exports = { getAIRecommendations };