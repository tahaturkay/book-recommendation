async function getBooksRequest(page = 1, searchQuery = "") {
  try {
    // localStorage ye kaydedilen tokeni çıkar
    const token = localStorage.getItem('jwt_token');

    // token yoksa hata
    if (!token) {
      throw new Error("Giriş yapılmamış. VİP bileklik bulunamadı.");
    }

    // "Bearer <token>" ekleyerek backende istek fırlattık görüntülemek için
    // burda ayrıyeten fetchlerken parametreleri de bakcende sallıyoruz
    const response = await fetch(`http://localhost:3000/api/main/main-books?page=${page}&search=${searchQuery}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // bizim token
      }
    });

    const data = await response.json();

    if (!response.ok) { // ok değilse durum
      throw new Error(data.error || 'Kitaplar getirilemedi');
    }

    return data; // backend'den books, totalPages, currentPage'i döndür
  } catch (error) {
    throw error;
  }
}

// önerilen kitapları çeken fonksiyon
async function getRecommendedBooksRequest(page = 1) {
    try {
    const token = localStorage.getItem('jwt_token');
    if (!token) throw new Error("Abu giris yapmadan nasil onericez sana kitap");

    // URL'yi dinamik olarak oluşturuyoruz
    let url = `http://localhost:3000/api/main/main-books?page=${page}`;
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`; // EKLENDİ

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'onerilenleri unut abi kaybettk');
        
        return data; 
    } catch (error) {
        throw error;
    }
}


// YENİ EKLENEN: Kategorileri çeken postacı
async function getCategoriesRequest() {
    try {
        const token = localStorage.getItem('jwt_token');
        if (!token) throw new Error("Giriş yapılmamış.");

        const response = await fetch(`http://localhost:3000/api/main/categories`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Kategoriler getirilemedi');
        return data; 
    } catch (error) {
        throw error;
    }
}
export { getBooksRequest, getRecommendedBooksRequest, getCategoriesRequest };