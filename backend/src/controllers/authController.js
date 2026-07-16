const pool = require("../config/db"); // databaseye erişiyoruz
const bcrypt = require("bcrypt"); // şifreyi hashlemek için

// register fonksiyonu
const register = async (req, res) => {
    try{
        const {username, email, password} = req.body; // kullanıcının yolladığı verileri aldık
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password,saltRounds); // şifreyi hashledik

        pool.query('INSERT INTO "User" (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashedPassword]); // databaseye kayıt olan kullanıcının bilgilerini attık
        res.status(201).json({
            message: "Kullanici olustu",
            user: {username, email, hashedPassword} // test icin
        });
    }catch{
        console.error(error);
        res.status(500).json({error: "sunucu hatasiymis guya"});
    }
};

// login fonksiyonu
const login = async (req, res) => {
    try{
        const {email, password} = req.body;
        const userInfo = await pool.query('SELECT * FROM "User" where email = $1',[email]); // email eşleşmesi var mı check ediyoruz
        if( userInfo.rowCount == 0){ // Eğer dönen satır sayısı 0 ise (eşleşme yoksa yani)
            console.log("There is no such user exist!!");
            return;
        }
        else{
            //const storedHashedPassword = await pool.query('SELECT password FROM "User" WHERE email = $1', [email]); // DB'deki kaydettiğimiz hashlenmiş şifreyi alıyoruz
            const isMatch = await bcrypt.compare(password,userInfo.rows[0].password); // kullanıcının girdiği şifre ile dbdeki şifre eşleşiyor mu kontrol ediyoruz
            if(isMatch){ // eşleşme varsa
                console.log("Password matched!");
                res.status(200).json({ // kodları araştır düzetl
                message: "Succesfully logined",
                user: {email},
                auth: true
            });
            }else{ // eşleşme yoksa
                console.log("Password didn't match :c");
                res.status(404).json({ // kodları araştır düzelt
                message: "Couldn't logined",
                user: {email},
                auth: false
            });
            };
        }
        
        
    }catch(error){
        console.log("TRY bloğu çalışmadı");
        console.error(error);
        res.status(401).json({error: "IDK man"});
    }
    
};
module.exports = { // fonksiyon diğer dosyalarda erişilebilir oluyor böylece
    register,
    login
};