const pool = require("../config/db"); // dbye erişim

const getMyLibrary = async (req,res) => {
    const email = req.user.email;
    try{
        const result = await pool.query('SELECT * FROM "Add_in_library" where "userEmail" = $1', [email]);
        res.status(200).json({books_owners: result.rows});
    } catch(error){
        res.status(500).json({error: "Abi senin kitaplik yandi ya"});
    }
};

module.exports = {
    getMyLibrary
};