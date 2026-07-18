const pool = require("../config/db"); // dbye erişim
const bcrypt = require("bcrypt"); // şifreyi hashlemek için
const jwt = require("jsonwebtoken"); // JWT ile authenticate edicez

// register fonksiyonu
const register = async (req, res) => {
    try{
        const {username, email, password} = req.body; // kullanıcının yolladığı verileri aldık
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password,saltRounds); // şifreyi hashledik

        // sql injection preventer
        await pool.query('INSERT INTO "User" (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashedPassword]); // databaseye kayıt olan kullanıcının bilgilerini attık
        res.status(201).json({
            message: "Kullanici olustu",
            user: {username, email, hashedPassword} // test icin
        });
    }catch(error){
        console.error(error);
        res.status(500).json({error: "Server error"});
    }
};

// login fonksiyonu
const login = async (req, res) => {
    try{
        const {email, password} = req.body;

        // burda userInfo'yu var'a çevirdik ama güvenli mi bu?
        const userInfo = await pool.query('SELECT * FROM "User" where email = $1',[email]); // email eşleşmesi var mı check ediyoruz
        if( userInfo.rowCount == 0){ // Eğer dönen satır sayısı 0 ise (eşleşme yoksa yani)
            console.log("There is no such user exist!!");
            // postman havada kalıyor res.status ekle
            res.status(404).json({
                message: "There is no such user",
                user: {email},
                auth: false
            });
            return;
        }
        else{
            const isMatch = await bcrypt.compare(password,userInfo.rows[0].password); // kullanıcının girdiği şifre ile dbdeki şifre eşleşiyor mu kontrol ediyoruz
            if(isMatch){ // eşleşme varsa
                console.log("Password matched!");

                let jwtSecretKey = process.env.JWT_SECRET;
                let data = {
                    email: userInfo.rows[0].email
                }
                const token = jwt.sign(data, jwtSecretKey);

                res.status(200).json({ // kodları araştır düzetl
                message: "Succesfully logined",
                user: {email},
                auth: true,
                generatedToken: token
            });
            }else{ // eşleşme yoksa
                console.log("Password didn't match :c");
                res.status(401).json({ 
                message: "Wrong password",
                user: {email},
                auth: false
            });
            };
        }
        
        
    }catch(error){
        console.error(error);
        res.status(500).json({error: "Server error"});
    }
    
};
module.exports = { // fonksiyon diğer dosyalarda erişilebilir oluyor böylece
    register,
    login
};