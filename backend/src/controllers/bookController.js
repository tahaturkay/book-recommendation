const pool = require("../config/db"); // dbye erişim

const getBooks = async (req, res) => {
    // frontend'den gelen sayfa numarasını al (varsayılan 1)
    const page = parseInt(req.query.page) || 1;
    const limit = 8; // her sayfada 8 kitap
    const offset = (page - 1) * limit; // atlanacak kitap sayısı

    try{
        const books = await pool.query('SELECT * FROM "Book" LIMIT $1 OFFSET $2', [limit, offset]); // sayfaya ait 8 kitabu çek
        const totalCountResult = await pool.query('SELECT COUNT(*) FROM "Book"'); // tüm kitap sayısını çek
        const totalCount = parseInt(totalCountResult.rows[0].count); // string olarak gelen sayfa sayısını inte çeviriyoruz

        res.status(200).json({
        books: books.rows,
        totalPages: Math.ceil(totalCount / limit),
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