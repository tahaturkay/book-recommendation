const pool = require("../config/db"); // dbye erişim

const getMyLibrary = async (req,res) => {
    const email = req.user.email;
    try{
        //const result = await pool.query('SELECT * FROM "Add_in_library" where "userEmail" = $1', [email]);
        const result = await pool.query('SELECT "Book"."title", "Book"."author", "Book"."category", "Book"."published_year", "Book"."publisher", "Book"."imageURL", "Book"."rating" FROM "Book" JOIN "Add_in_library" ON "Book"."bookID" = "Add_in_library"."bookID" WHERE "Add_in_library"."userEmail" = $1', [email]);
        res.status(200).json({books_owners: result.rows});
    } catch(error){
        console.error(error.message);
        res.status(500).json({error: "Abi senin kitaplik yandi ya"});
    }
};

const addToMyLibrary = async (req, res) => {
    const {bookID} = req.body; // bookID'yi direkt fronttan al
    const email = req.user.email; // IDOR'dan korunmak için req.userdan al
    try{
        const result = await pool.query('INSERT INTO "Add_in_library" ("bookID", "userEmail") VALUES ($1, $2) RETURNING *', [bookID, email]);
        res.status(201).json({added_book: result.rows});
    } catch(error){
        console.error(error.message);
        res.status(500).json({error: "Abi senin kitabi ekleyemedik puh"});
    }
};

const deleteFromLibrary = async (req, res) => {
    const {bookID} = req.params; // postlarda body içinden req.body ile alıyoduk, burda URL'den alırken params kullanıyoz
    const email = req.user.email;
    try{
        const result = await pool.query('DELETE FROM "Add_in_library" WHERE "userEmail" = $1 AND "bookID" = $2', [email, bookID]);
        res.status(200).json({deleted_book: result.rows});
    } catch(error){
        console.error(error.message);
        res.status(500).json({error: "Abi senin kitabi silemedik ya kb"});
    }
};

module.exports = {
    getMyLibrary,
    addToMyLibrary,
    deleteFromLibrary
};