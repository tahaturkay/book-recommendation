const pool = require("../config/db"); // dbye erişim

const addReview = async (req, res) => {
    const {bookID} = req.params; // postlarda body içinden req.body ile alıyoduk, burda URL'den alırken params kullanıyoz
    const {rating, comment} = req.body; // bookID'yi direkt fronttan al
    const email = req.user.email; // IDOR'dan korunmak için req.userdan al 
    try{
        const result = await pool.query('INSERT INTO "Review" ("rating", "comment", "has", "writes") VALUES ($1, $2, $3, $4) RETURNING *', [rating, comment, bookID, email]);
        
        // Kitabın mevcut dataları
        const bookData = await pool.query('SELECT "rating", "numRatings" FROM "Book" WHERE "bookID" = $1', [bookID]);
        const currentRating = parseFloat(bookData.rows[0].rating) || 0;
        const numRatings = parseInt(bookData.rows[0].numRatings) || 0;

        // Denklemler
        const newNumRatings = numRatings + 1;
        const newRating = ((numRatings * currentRating) + rating) / newNumRatings;

        // Kitabın güncellenmiş datalarını updateliyoruz
        await pool.query('UPDATE "Book" SET "rating" = $1, "numRatings" = $2 WHERE "bookID" = $3', [newRating.toFixed(2), newNumRatings, bookID]);
        
        res.status(201).json({reviewed_book: result.rows});
    } catch(error){
        console.error(error.message);
        res.status(500).json({error: "Abi senin reviewi ekleyemedik kitaba"});
    }
};

const getBookReviews = async (req, res) => {
    const {bookID} = req.params; // postlarda body içinden req.body ile alıyoduk, burda URL'den alırken params kullanıyoz

    try{
        const result = await pool.query('SELECT "Review"."comment", "Review"."rating", "User"."username", "Review"."reviewID", "Review"."writes" FROM "Review" JOIN  "User" ON "Review"."writes" = "User"."email" WHERE "Review"."has" = $1', [bookID]);
        res.status(200).json({get_reviews: result.rows});
    } catch(error){
        console.error(error.message);
        res.status(500).json({error: "Abi kitaptaki reviewleri çekemedik"});
    }
};

const deleteReview = async (req, res) => {
    const {reviewID} = req.params; // postlarda body içinden req.body ile alıyoduk, burda URL'den alırken params kullanıyoz
    const email = req.user.email; // IDOR'dan korunmak için req.userdan al (postgreden başka birisinin başkasının yorumu silebilmesi) 

    try{
        // silinecek yorumun sahibi ve kitabı çektik
        const oldReviewData = await pool.query('SELECT "rating", "has" FROM "Review" WHERE "reviewID" = $1 AND "writes" = $2', [reviewID, email]);
        
        if (oldReviewData.rowCount === 0) {
            return res.status(403).json({ error: "Bu yorumu silme yetkiniz yok." });
        }

        const deletedUserRating = parseFloat(oldReviewData.rows[0].rating);
        const bookID = oldReviewData.rows[0].has;

        // yorumu siliyoz
        const result = await pool.query('DELETE FROM "Review" WHERE "reviewID" = $1 RETURNING *', [reviewID]);

        // kitabın güncel puanı
        const bookData = await pool.query('SELECT "rating", "numRatings" FROM "Book" WHERE "bookID" = $1', [bookID]);
        const currentRating = parseFloat(bookData.rows[0].rating) || 0;
        const numRatings = parseInt(bookData.rows[0].numRatings) || 0;

        // silme denklemi
        const newNumRatings = Math.max(0, numRatings - 1);
        let newRating = 0;
        
        if (newNumRatings > 0) {
            newRating = ((numRatings * currentRating) - deletedUserRating) / newNumRatings;
        }

        // kitap puan datasını güncelliyoruz
        await pool.query('UPDATE "Book" SET "rating" = $1, "numRatings" = $2 WHERE "bookID" = $3', 
            [newRating.toFixed(2), newNumRatings, bookID]
        );
        res.status(200).json({deleted_review: result.rows});
    } catch(error){
        console.error(error.message);
        res.status(500).json({error: "Abi kitaptaki reviewi silemedik"});
    }
};

const updateReview = async (req, res) => {
    const {reviewID} = req.params; // postlarda body içinden req.body ile alıyoduk, burda URL'den alırken params kullanıyoz
    const {rating, comment} = req.body; // bookID'yi direkt fronttan al
    const email = req.user.email; // IDOR'dan korunmak için req.userdan al

    try{
        // eski puanı ve kitabın ID'sini çekiyoruz
        const oldReviewData = await pool.query('SELECT "rating", "has" FROM "Review" WHERE "reviewID" = $1 AND "writes" = $2', [reviewID, email]);
        
        if (oldReviewData.rowCount === 0) {
            return res.status(403).json({ error: "Bu yorumu güncelleme yetkiniz yok." });
        }

        const oldUserRating = parseFloat(oldReviewData.rows[0].rating);
        const bookID = oldReviewData.rows[0].has;

        // Kitabın güncel puanı
        const bookData = await pool.query('SELECT "rating", "numRatings" FROM "Book" WHERE "bookID" = $1', [bookID]);
        const currentRating = parseFloat(bookData.rows[0].rating) || 0;
        const numRatings = parseInt(bookData.rows[0].numRatings) || 0;

        // sadece puan değişikliği yapıldıysa yeniden hesaplama yap
        if (oldUserRating !== rating && numRatings > 0) {
            const newRating = ((numRatings * currentRating) - oldUserRating + rating) / numRatings;
            
            await pool.query('UPDATE "Book" SET "rating" = $1 WHERE "bookID" = $2', [newRating.toFixed(2), bookID]);
        }

        // yorumu güncelle
        const result = await pool.query(
            'UPDATE "Review" SET "comment" = $1, "rating" = $2 WHERE "reviewID" = $3 RETURNING *', [comment, rating, reviewID]);
        res.status(200).json({updated_review: result.rows});
    } catch(error){
        console.error(error.message);
        res.status(500).json({error: "Abi kitaptaki reviewi güncelleyemedik"});
    }
};

module.exports = {
    addReview,
    getBookReviews,
    deleteReview,
    updateReview
};