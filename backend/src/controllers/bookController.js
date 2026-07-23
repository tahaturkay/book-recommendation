const pool = require("../config/db"); // dbye erişim

const getBooks = async (req, res) => {
    // frontend'den gelen sayfa numarasını al (varsayılan 1)
    const page = parseInt(req.query.page) || 1;
    const limit = 8; // her sayfada 8 kitap
    const offset = (page - 1) * limit; // atlanacak kitap sayısı

    const search = req.query.search || ""; // arama kelimesi frontendden gelen


    try{
        let booksQuery = '';
        let countQuery = '';
        let queryParams = [limit, offset];
        let countParams = [];

        // 2. EKLENDİ: Eğer arama kelimesi varsa SQL sorgusunu filtreli hale getir
        if (search) {
            // Kitap adında VEYA yazar adında geçiyorsa getir (ILIKE büyük/küçük harf takmaz)
            booksQuery = 'SELECT * FROM "Book" WHERE title ILIKE $3 OR author ILIKE $3 LIMIT $1 OFFSET $2';
            countQuery = 'SELECT COUNT(*) FROM "Book" WHERE title ILIKE $1 OR author ILIKE $1';
            
            // $3 ve $1 parametreleri için arama kelimesinin sağına ve soluna % ekliyoruz (İçinde geçmesi yeterli)
            queryParams.push(`%${search}%`);
            countParams.push(`%${search}%`);
        } else {
            // Arama yoksa normal çalışmaya devam et
            booksQuery = 'SELECT * FROM "Book" LIMIT $1 OFFSET $2';
            countQuery = 'SELECT COUNT(*) FROM "Book"';
        }

        const books = await pool.query(booksQuery, queryParams);
        const totalCount = await pool.query(countQuery, countParams);

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

module.exports = { // fonksiyon diğer dosyalarda erişilebilir oluyor böylece
    getBooks
};