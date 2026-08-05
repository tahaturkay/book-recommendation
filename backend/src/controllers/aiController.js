const pool = require('../config/db');
const Groq = require('groq-sdk'); // Groq kütüphanesini dahil ettik   
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); // groqcuğumuza API KEY'ini verdik
const { evaluateRecommendationGROQ, evaluateRecommendationGEMINI } = require('../jobs/aiJudge');

const getAIRecommendations = async (req, res) => {
    
    try {
        const email = req.user.email; 

        // Kullanıcının REVIEW'lerini çekiyoruz
        const userReviewsQuery = `
            SELECT b."bookID", b.title, b.category, b.author, r.rating 
            FROM "Review" r
            JOIN "Book" b ON r.has = b."bookID"
            WHERE r.writes = $1
        `;
        const userReviewsData = await pool.query(userReviewsQuery, [email]);
        const userReviews = userReviewsData.rows;

        // eğer daha önce hiç review yapmamışsa
        if (userReviews.length === 0) {
            return res.status(400).json({ error: "Öneri yapılabilmesi için önce kitap incelemesi yap abi" });
        }

        // Ratinge göre kitapları grupluyoruz
        const lovedBooks = userReviews.filter(r => r.rating >= 4);
        const neutralBooks = userReviews.filter(r => r.rating === 3);
        const dislikedBooks = userReviews.filter(r => r.rating <= 2);
        // Kullanıcının daha önce okuduğu kitapları ayıklıyoruz
        const readBookIds = userReviews.map(f => f.bookID);
        
        // Pozitif veya nötr olan kitap kategorilerini ve yazarlarını çektik
        const targetCategories = [...new Set([...lovedBooks, ...neutralBooks].map(b => b.category).filter(Boolean))];
        const targetAuthors = [...new Set([...lovedBooks, ...neutralBooks].map(b => b.author).filter(Boolean))];

        // Kullanıcının iğrendiği, varlığına lanet ettiği kategorileri çektik
        const dislikedCategories = [...new Set(dislikedBooks.map(b => b.category).filter(Boolean))];

        // R (RETRIEVAL) - bizim dbden kitap çekiyoruz
        let catalogQuery = ""; // katalogtaki şartları sağlayan kitaplardan önerilecekleri bu query ile ayıklıycak groqcum
        let queryParams = []; // buna önereceğimiz kitap, yazar ve katmayacağımız kitapları atıcaz
        let catalogBooks = []; // yazar, kategori şartını sağlayan kitapları buraya sallıycaz

        if (targetCategories.length > 0 || targetAuthors.length > 0) {
            // Kullanıcının 3, 4 veya 5 verdiği en az bir kitap varsa
            catalogQuery = `
                SELECT "bookID", title, author, category, popularity_score 
                FROM "Book"
                WHERE (category = ANY($1::text[]) OR author = ANY($2::text[]))
                AND NOT ("bookID" = ANY($3::int[])) 
                ORDER BY popularity_score DESC
                LIMIT 40
            `;
            queryParams = [targetCategories, targetAuthors, readBookIds];
            } else {
            // Kullanıcı yaptığı tüm reviewlerde tiksindiyse kitaplardan
            // Sevmediği kategorileri hariç tutup en popülerleri getiriyoruz
            catalogQuery = `
                SELECT "bookID", title, author, category, popularity_score 
                FROM "Book"
                WHERE NOT (category = ANY($1::text[]))
                AND NOT ("bookID" = ANY($2::int[])) 
                ORDER BY popularity_score DESC
                LIMIT 40
            `;
            queryParams = [dislikedCategories, readBookIds];
        }

        const catalogData = await pool.query(catalogQuery, queryParams); // reviewdeki duruma göre şartları sağlayan kitapları buraya salladık
        catalogBooks = catalogData.rows; // sadece kitapları çektik

        if (catalogBooks.length === 0) { // eğer şartları sağlayan kitap çıkmadıysa ortaya
        return res.status(404).json({ error: "Sana özel niş bir kitap bulamadık reisim :c" });
        }

        // A (AUGMENTED) - promptumuzu coşturucaz (AOW YEAS)
        // Çektiğimiz 40 kitabı yapay zekanın okuyabileceği bir "Katalog" metnine çeviriyoruz
        const catalogText = catalogBooks.map(b => `- ID: ${b.bookID} | ${b.title} | Yazar: ${b.author} | Kategori: ${b.category}`).join('\n');
        
        const lovedText = lovedBooks.length > 0 ? lovedBooks.map(b => b.title).join(', ') : "Yok"; // eğer sevdiği kitap varsa virgül koya koya hepsini ekliyo, yoksa yok diyo
        const neutralText = neutralBooks.length > 0 ? neutralBooks.map(b => b.title).join(', ') : "Yok"; // yukardakinin nötrlüsü
        const dislikedText = dislikedBooks.length > 0 ? dislikedBooks.map(b => `${b.title} (Yazar: ${b.author})`).join(', ') : "Yok"; // yukardakinin tiksindiği senaryolusu
                
        const prompt = `
            Sen uzman bir sahaf kütüphanecisisin. Kullanıcının kitap okuma zevki hakkında şu verilere sahibiz:
            - Bayıldığı Kitaplar (4-5 Yıldız): ${lovedText}
            - Orta Bulduğu Kitaplar (3 Yıldız): ${neutralText}
            - Hiç Sevmediği Kitaplar (1-2 Yıldız): ${dislikedText}

            GÖREVİN:
            Aşağıdaki "Katalog" listesinden, kullanıcının BAYILDIĞI kitapların temasına uygun, ORTA bulduğu kitapları göz önünde bulunduran, ancak HİÇ SEVMEDİĞİ kitapların tarzından ve yazarlarından KESİNLİKLE UZAK DURAN en iyi 15 kitabı seçmektir.

            --- Katalog Başlangıcı ---
            ${catalogText}
            --- Katalog Sonu ---

            Katalog dışında kafandan ASLA kitap uydurma.
            Seçtiğin kitapları popularity_score'a göre değil, kullanıcının zevkine en çok uyandan en aza uyana doğru sırala.

            Cevabını SADECE aşağıdaki JSON formatında ver, kod bloğu veya ekstra metin kullanma:
            [
            {
                "bookID": Seçtiğin kitabın ID'si,
                "title": "Kitap Adı",
            }
            ]
            `;

        // G (GENERATION) - let AI cook
        const startTime = Date.now(); // kaç saniyede dönüt verdiğini ölçmek için

        // groq'a gönderip cevabı alacaiz (Llama 3.3 70B modeli)
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile", // güncel modelimiz
            temperature: 0.5,
        });

       // gelen cevabı json'a çeviriyoruz
        let aiText = response.choices[0]?.message?.content || "";
        aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();

        const recommendations = JSON.parse(aiText);

        // süreyi durduruyoruz (bize ne kadar sürede çıktıyı verdiğini söylüyo (input + output süresi total))
        const endTime = Date.now();
        // milisaniyeyi saniyeye çevirip virgülden sonra 2 hane alıyoruz
        const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);
        console.log(`Yanit süresi: ${durationInSeconds} saniye`);

        // AI'ın seçtiği kitapların tüm detaylarını db'den çekmek için bookID'yi alıyoruz
        const recommendedBookIds = recommendations.map(r => r.bookID);
        
        // kitapların tüm özelliklerini alıyoruz
        const finalBooksQuery = `SELECT * FROM "Book" WHERE "bookID" = ANY($1::int[])`;
        const finalBooksData = await pool.query(finalBooksQuery, [recommendedBookIds]);
        
        let finalBooks = finalBooksData.rows;

        // Frontend'deki BookShelf'e "recommendedBooks" adıyla yolluyoz ordan şow yapıyoruz sonrasında
        res.status(200).json({
            message: "Abim sadece sana ozel bak bu kitaplar",
            recommendedBooks: finalBooks, 
            hasMore: true, // frontta 12 yaptıydım shelf sınırını (EĞER LİMİTİ DEĞİŞTİRİCEK OLURSAM BURAYI UNUTMA)
            aiDuration: `${durationInSeconds} saniye`
        });


        // LLM-as-a-judge ile groq'cuğumun önerilerini puanlıyoruz
        (async () => {
            console.log("[LLM-as-a-Judge] GROQ Hakem değerlendirmesi:");
            
            let totalScore = 0;

            const userTastes = `Sevdiği Kitaplar: ${lovedText}. Nötr olduğu Kitaplar: ${neutralText}. Nefret ettiği Kitaplar: ${dislikedText}.`;
            
            // groq'un önerdiği 15 kitabı tek tek groqa yolluyoz
            for (const rec of recommendations) {
                // userTastes : iste adamin genel ilgi karakteristigi
                // rec : groq onerileri
                const judgeResult = await evaluateRecommendationGROQ(userTastes, rec);
                
                if (judgeResult) {
                    totalScore += judgeResult.score;
                    console.log(`\nKitap: ${rec.title}`);
                    console.log(`Puan: ${judgeResult.score}/10`);
                    console.log(`GROQ Hakem Yorumu: ${judgeResult.critique}`);
                }
            }
            
            const averageScore = (totalScore / recommendations.length).toFixed(1);
            console.log(`\nGROQ ÖNERİ GENEL KALİTE ORTALAMASI: ${averageScore}/10`);
        })();


        // Gemini'nin hakimligi
        (async () => {
            console.log("LLM-as-a-Judge GEMINI Hakem değerlendirmesi:");
            
            let totalScore = 0;

            const userTastes = `Sevdiği Kitaplar: ${lovedText}. Nötr olduğu Kitaplar: ${neutralText}. Nefret ettiği Kitaplar: ${dislikedText}.`;
            
            // groq'un önerdiği 15 kitabı tek tek gemini'ye sunuyoruz
            for (const rec of recommendations) {
                const judgeResult = await evaluateRecommendationGEMINI(userTastes, rec);
                
                if (judgeResult) {
                    totalScore += judgeResult.score;
                    console.log(`\nKitap: ${rec.title}`);
                    console.log(`Puan: ${judgeResult.score}/10`);
                    console.log(`GEMINI Hakem Yorumu: ${judgeResult.critique}`);
                }
            }
            
            const averageScore = (totalScore / recommendations.length).toFixed(1);
            console.log(`\nGEMINI ÖNERİ GENEL KALİTE ORTALAMASI: ${averageScore}/10`);
            
        })();
    } catch (error) {
        console.error("AI RAG Hatasi:", error);
        res.status(500).json({ error: "Aradiginiz yapay zeka şuan yapamay" });
    }
};

module.exports = { getAIRecommendations };