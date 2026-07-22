async function getBooksRequest(page = 1) {
  try {
    // localStorage ye kaydedilen tokeni çıkar
    const token = localStorage.getItem('jwt_token');

    // token yoksa hata
    if (!token) {
      throw new Error("Giriş yapılmamış. VİP bileklik bulunamadı.");
    }

    // "Bearer <token>" ekleyerek backende istek fırlattık görüntülemek için
    const response = await fetch(`http://localhost:3000/api/main/main-books?page=${page}`, {
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

export { getBooksRequest };