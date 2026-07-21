const express = require("express");
const cors = require("cors"); // CORS'u çağıracz
const app = express();
const pool = require("./config/db"); // Database dosyasına erişim.
const authRoutes = require("./routes/authRoutes");
const libraryRoutes = require("./routes/libraryRoutes");
require("dotenv").config(); 

app.use(express.json()); // gelen json verileri okuyor
app.use(cors()); // farklı portlarda çalışan frontend ve backend sıkıntı çıkarmasın diye
app.use("/api/auth", authRoutes); // gelen istek /api/auth ile başlıyorsa authRoutes'e yolluyor bu isteği
app.use("/api/library", libraryRoutes); // librarye istek gelirse

const port = process.env.PORT || 3000; // backendin çalıştığı port

app.listen(port, () => {
    console.log(`Server ${port} portunda çalışıyor`);
});
