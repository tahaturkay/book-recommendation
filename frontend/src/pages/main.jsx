// src/pages/Main.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { getBooksRequest } from '../services/mainService';

function main() { // başta hafızalar oluşturuyoz
    const [books, setBooks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchInput, setSearchInput] = useState(''); // Kullanıcının o an yazdığı metin
    const [activeSearch, setActiveSearch] = useState(''); // arama butonuna basıldığında kesinleşen metin

    const navigate = useNavigate();

    // useEffect: Sayfa ilk açıldığında veya currentPage değiştiğinde bu bloğu çalıştırır
    useEffect(() => {
        const fetchBooks = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await getBooksRequest(currentPage, activeSearch);
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
    }, [currentPage, activeSearch, navigate]); // Bu dizideki (dependency array) değerler değiştiğinde fetchBooks tekrar çalışır

    // arama butonu fonksiyonu
    const handleSearchSubmit = (e) => {
        e.preventDefault(); // Sayfanın yenilenmesini engeller
        setCurrentPage(1); // Yeni bir arama yapılınca her zaman 1. sayfaya dön!
        setActiveSearch(searchInput); // Hafızadaki arama kelimesini aktifleştir
    };

    // Sayfalama Buton Fonksiyonları
    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
    
      {/* Üst Kısım: başlık, arama butonu ve kütüphane butonu */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2> Aktaşlar Sahafcılık 2024'den beri</h2>

            {/*  arama çubuğu */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
                <input 
                    type="text" 
                    placeholder="Kitap veya yazar ara..." 
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    style={{ padding: '10px', width: '300px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
                    <button type="submit" style={{ padding: '10px 15px', borderRadius: '8px', border: 'none', backgroundColor: '#0b57d0', color: 'white', cursor: 'pointer' }}>
                        Ara
                    </button>
                
                {/* Eğer arama yapıldıysa 'Temizle' butonu çıksın */}
                {activeSearch && (
                    <button type="button" onClick={() => { setSearchInput(''); setActiveSearch(''); setCurrentPage(1); }} style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#567dbb', cursor: 'pointer' }}>
                    Temizle
                    </button>
                )}
            </form>

            {/* kütüphane açma butonu */}
            <button style={{ padding: '10px 15px', borderRadius: '8px', border: 'none', backgroundColor: '#333', color: 'white', cursor: 'pointer' }}>
            Kütüphanemi Aç (Şimdi değil ama abi)
            </button>
        </div>

        {/* LAZY LOADING - - - - iskelet animasyonu için CSS keyframes tanımlaması */}
        <style>
            {`
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            .skeleton-box {
                background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 4px;
            }
            `}
        </style>
    
    
    
        {/* İSKELET KART - - - - 8 adet iskelet kartı gösterimi */}
        {isLoading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px', marginBottom: '40px' }}>
            {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} style={{ width: '100%', maxWidth: '240px', height: '300px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Üst Kısım: Resim İskeleti */}
                <div className="skeleton-box" style={{ height: '65%', width: '100%', borderRadius: '0' }}></div>
                
                {/* Alt Kısım: Bilgi İskeleti */}
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', height: '35%', gap: '10px' }}>
                    <div className="skeleton-box" style={{ height: '20px', width: '80%' }}></div> {/* Başlık */}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '50%' }}>
                        <div className="skeleton-box" style={{ height: '12px', width: '40%' }}></div> {/* Yıl */}
                        <div className="skeleton-box" style={{ height: '16px', width: '80%' }}></div> {/* Yazar */}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '30%', alignItems: 'flex-end' }}>
                        <div className="skeleton-box" style={{ height: '16px', width: '100%' }}></div> {/* Puan */}
                        <div className="skeleton-box" style={{ height: '12px', width: '60%' }}></div> {/* Oy sayısı */}
                    </div>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}

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