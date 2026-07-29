const pool = require("../config/db"); // dbye erişim

const addReview = async (req, res) => {
    const {bookID} = req.params; // postlarda body içinden req.body ile alıyoduk, burda URL'den alırken params kullanıyoz
    const {rating, comment} = req.body; // bookID'yi direkt fronttan al
    const email = req.user.email; // IDOR'dan korunmak için req.userdan al 
    try{
        const result = await pool.query('INSERT INTO "Review" ("rating", "comment", "has", "writes") VALUES ($1, $2, $3, $4) RETURNING *', [rating, comment, bookID, email]);
        res.status(201).json({reviewed_book: result.rows});
    } catch(error){
        console.error(error.message);
        res.status(500).json({error: "Abi senin reviewi ekleyemedik kitaba"});
    }
};

const getBookReviews = async (req, res) => {
    const {bookID} = req.params; // postlarda body içinden req.body ile alıyoduk, burda URL'den alırken params kullanıyoz

    try{
        const result = await pool.query('SELECT "Review"."comment", "Review"."rating", "User"."username" FROM "Review" JOIN  "User" ON "Review"."writes" = "User"."email" WHERE "Review"."has" = $1', [bookID]);
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
        const result = await pool.query('DELETE FROM "Review" WHERE "reviewID" = $1 AND "writes" = $2 RETURNING *', [reviewID,email]);
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
        const result = await pool.query('UPDATE "Review" SET "comment" = $1 , "rating" = $2 WHERE "Review"."reviewID" = $3 AND "Review"."writes" = $4 RETURNING *', [comment,rating,reviewID, email]);
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