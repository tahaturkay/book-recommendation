const { Pool } = require("pg"); // supabase postgres ile çalışıyor bu yüzden pool da postgres ile çalışıcak
require("dotenv").config(); // .env dosyasındaki şifreleri okuması için

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

module.exports = pool;