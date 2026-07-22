// src/pages/Main.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { getBooksRequest } from '../services/mainService';

function main() {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // useEffect: Sayfa ilk açıldığında veya currentPage değiştiğinde bu bloğu çalıştırır
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await getBooksRequest(currentPage);
        setBooks(data.books);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err.message);
        // Eğer token yoksa veya süresi bitmişse, kullanıcıyı tekrar login sayfasına yolla
        if (err.message.includes('bileklik') || err.message.includes('Token')) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [currentPage, navigate]); // Bu dizideki (dependency array) değerler değiştiğinde fetchBooks tekrar çalışır

  // Sayfalama Buton Fonksiyonları
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Üst Kısım: Başlık ve Kütüphane Butonu Yeri */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2> Aktaşlar Sahafcılık 2024'den beri</h2>
        <button style={{ padding: '10px 15px', borderRadius: '8px', border: 'none', backgroundColor: '#333', color: 'white', cursor: 'pointer' }}>
          Kütüphanemi Aç (Şimdi değil ama abi)
        </button>
      </div>

      {/* Yükleniyor veya Hata Durumu */}
      {isLoading && <p>Kitaplar raflardan diziliyor...</p>}
      {error && <p style={{ color: 'red' }}>Hata: {error}</p>}

      {/* Kitaplar Izgarası (Grid: Yanyana 4, alt alta 2 kitap) */}
      {!isLoading && !error && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', // 4 eşit sütun
          gap: '30px', // Kartlar arası boşluk
          marginBottom: '40px'
        }}>
          {books.map((book) => (
            <BookCard key={book.bookID} book={book} />
          ))}
        </div>
      )}

      {/* Sayfalama (Pagination) Kontrolleri */}
      {!isLoading && !error && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={handlePrevPage} 
            disabled={currentPage === 1}
            style={{ padding: '8px 16px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', borderRadius: '5px', border: '1px solid #ccc' }}
          >
            Önceki
          </button>
          
          <span style={{ fontWeight: 'bold', color: '#555' }}>
            Sayfa {currentPage} / {totalPages}
          </span>

          <button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
            style={{ padding: '8px 16px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', borderRadius: '5px', border: '1px solid #ccc' }}
          >
            Sonraki
          </button>
        </div>
      )}

    </div>
  );
}

export default main;