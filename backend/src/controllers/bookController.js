const pool = require("../config/db"); // dbye erişim

const getBooks = async (req, res) => {
    try{
        // urlde "?" den sonrasi querymiş, express bunu json formatına getiriyo, ordan değerleri çekiyoruz
        const page = parseInt(req.query.page) || 1; // page: anahtarı ile sayfayı çekiyoruz
        const limit = 8; // her sayfada 8 kitap
        const offset = (page - 1) * limit; // atlanacak kitap sayısı

        const search = req.query.search || ""; // arama parametresini çekiyoruz urlden
        const category = req.query.category || ""; // kategori parametresini çekiyoruz urlden
        console.log("fronttan gelen kategori", category); // test etmek için
        
        // dinmakik sql sorgusu oluşturma
        let queryText = 'SELECT * FROM "Book" WHERE 1=1';
        let countText = 'SELECT COUNT(*) FROM "Book" WHERE 1=1';
        const queryParams = [];
        let paramCount = 1; // parametrelerin gelmesi için yer tutuculuk yapacak

        // aramayı sorguya ekleme
        if (search) {
            queryText += ` AND ("title" ILIKE $${paramCount} OR "author" ILIKE $${paramCount})`;
            countText += ` AND ("title" ILIKE $${paramCount} OR "author" ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
            paramCount++; // yer tutucuyu artırıyoruz
        }

        // kategoriyi sorguya ekleme
        if (category) {
            queryText += ` AND "category" = $${paramCount}`;
            countText += ` AND "category" = $${paramCount}`;
            queryParams.push(category);
            paramCount++; // yer tutucuyu artırıyoruz
        }

        // Sıralama ve sayfalama ekleniyor
        queryText += ` ORDER BY "bookID" ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        
        // burda sorguyu yapıyoruz
        const books = await pool.query(queryText, [...queryParams, limit, offset]);
        const totalCount = await pool.query(countText, [...queryParams]);

        res.status(200).json({
            books: books.rows,
            totalPages: Math.ceil(totalCount.rows[0].count / limit),
            currentPage: page
        });
    }catch(error){
        console.error(error.message);
        res.status(500).json({message: "Abi pagination ile kitaplari listeleyemedik ozr dlerm."});
    }    
};


// popüler kitapları getiren fonlsiyon - ilerde AI ile çalıştırcam bunu
const getTopRecommendedBooks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const offset = (page - 1) * limit; // Hangi sayfadaysak öncekileri atla

        // en çok değerlendirilen 12 kitabı azalan sırayla getir
        const topBooksQuery = `
            SELECT * FROM "Book" 
            ORDER BY "numRatings" DESC NULLS LAST, "bookID" ASC
            LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(topBooksQuery, [limit, offset]);
        const hasMore = result.rows.length === limit;

        res.status(200).json({
            recommendedBooks: result.rows,
            hasMore: hasMore
        });
    } catch (error) {
        console.error("Abu onerilen kitaplari cekemedik:", error.message);
        res.status(500).json({ error: "Onerilen kitaplari unut" });
    }
};


// Veritabanındaki tüm benzersiz kategorileri getiren fonksiyon
const getCategories = async (req, res) => {
    try {
        // tekrar edenleri teke düşür
        const result = await pool.query('SELECT DISTINCT category FROM "Book" WHERE category IS NOT NULL ORDER BY category ASC');
        
        // Sadece kategori isimlerini içeren basit bir dizi (array) dönelim
        const categories = result.rows.map(row => row.category);
        res.status(200).json({ categories });
    } catch (error) {
        console.error("Kategoriler çekilirken hata:", error.message);
        res.status(500).json({ error: "Kategoriler yüklenemedi." });
    }
};

module.exports = { // fonksiyon diğer dosyalarda erişilebilir oluyor böylece
    getBooks,
    getTopRecommendedBooks,
    getCategories
};