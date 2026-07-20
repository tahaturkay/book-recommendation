const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"]; // istekten gelen header alınıyo
    
    // "Bearer <token>" şeklinde geldiği için boşluktan bölüp 2. kısmı yani tokeni alıyoruz
    const token = authHeader.split(" ")[1]; 

    if (!token) { // eğer token yoksa, yollanmamışsa
        return res.status(401).json({ error: "Access debied" });
    }

    // token'in geçerliliği kontrol ediliyo
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedData) => {
        if (err) {
            // sahte veya süresi bitme durumunda
            return res.status(403).json({ error: "Geçersiz veya süresi dolmuş" });
        }

        // token geçerliyse decoded edilmiş veri req.user'a atanıyo (email falan ne attıysak artık içine)
        req.user = decodedData; 
        
        // burdan controllera yolcu ediyoruz
        next(); 
    });
};

module.exports = verifyToken;