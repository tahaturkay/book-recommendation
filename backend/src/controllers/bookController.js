const pool = require("../config/db"); // dbye erişim

const getBooks = async (req, res) => {
    // frontend'den gelen sayfa numarasını al (varsayılan 1)
    const page = parseInt(req.query.page) || 1;
    const limit = 8; // her sayfada 8 kitap
    const offset = (page - 1) * limit; // atlanacak kitap sayısı

    // sayfaya ait 8 kitabı çek
    try{
        const books = await pool.query('SELECT * FROM "Book" LIMIT $1 OFFSET $2', [limit, offset]);
        res.status(200).json({message: "Kral senin 8 kitap içeren sayfayi çektm al"});
    }catch(error){
        res.status(500).json({message: "Abi pagination ile kitaplari listeleyemedik ozr dlerm."});
        console.error(error.message);
    }
    // toplam kitap sayısını çek (frontun kaç sayfa olacağını göstermek için)
    try{
        const totalCount = await pool.query('SELECT COUNT(*) FROM "Book"');
        res.status(200).json({message: "abu tum kitaplari cektim buyur."});
    }catch(error){
        res.status(500.).json({message: "maine kitaplari cekemedim ama bizim bi arkadas var o da cekemedi"});
        console.error(error.message);
    }
    res.json({
        books: books.rows,
        totalPages: Math.ceil(totalCount.rows[0].count / limit),
        currentPage: page
    });
};

module.exports = { // fonksiyon diğer dosyalarda erişilebilir oluyor böylece
    getBooks
};