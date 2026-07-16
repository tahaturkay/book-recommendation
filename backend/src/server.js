const express = require("express");
const app = express();
const pool = require("./config/db"); // Database dosyasına erişim.
const authRoutes = require("./routes/authRoutes");
require("dotenv").config(); 

app.use(express.json()); // gelen json verileri okuyor
app.use("/api/auth", authRoutes); // gelen istek /api/auth ile başlıyorsa authRoutes'e yolluyor bu isteği


const port = process.env.PORT || 3000; // backendin çalıştığı port

app.listen(port, () => {
    console.log(`Server ${port} portunda çalışıyor`);
});
