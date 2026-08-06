import React, { useRef, useState, useEffect } from 'react';
import BookCard from './bookCard';
import { getRecommendedBooksRequest } from '../services/mainService';

function BookShelf({onCardClick}) {
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(1); // YENİ: Hangi sayfada olduğumuzu tutar
    const [hasMore, setHasMore] = useState(true); // YENİ: Daha fazla kitap var mı?
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef(null); // CSS ile kaydırma alanına müdahale etmek için referans
    const [isLoadingMore, setIsLoadingMore] = useState(false); // YENİ: Ekstra yükleme mi yapılıyor?

    // YENİ EKLENDİ: Yapay zekanın mesajlarını ekrana basmak için
    const [aiMessage, setAiMessage] = useState('');

    // Kitapları çeken ortak fonksiyonumuz
    // Kitapları çeken ortak fonksiyonumuz
    const fetchRecommendations = async (currentPage) => {
        if (currentPage === 1) setIsLoading(true);
        else setIsLoadingMore(true);
        setAiMessage(''); // Her istekte eski mesajı temizle
        
        try {
            const data = await getRecommendedBooksRequest(currentPage);
            
            // SENİOR DOKUNUŞU (GÜVENLİK KALKANI): 
            const incomingBooks = data?.recommendedBooks || data?.recommendations || [];

            if (currentPage === 1) {
                // DÜZELTME BURADA: 'data.incomingBooks' yerine sadece 'incomingBooks' yazdık.
                setBooks(incomingBooks);
            } else {
                setBooks(prevBooks => {
                    // Ekstra Güvenlik: prevBooks undefined ise boş dizi kabul et
                    const safePrev = prevBooks || []; 
                    const existingIds = new Set(safePrev.map(book => book.bookID));
                    
                    const newUniqueBooks = incomingBooks.filter(newBook => !existingIds.has(newBook.bookID));
                    return [...safePrev, ...newUniqueBooks];
                });
            }
            setHasMore(data?.hasMore || false);
        } catch (err) {
            console.error("Öneri hatası:", err);
            setAiMessage(err.message);
            // Olası bir hatada ekranın çökmesini engellemek için kitapları boşalt
            if (currentPage === 1) setBooks([]); 
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchRecommendations(1);
    }, []);

    // Daha fazla yükle butonuna basıldığında çalışacak fonksiyon
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchRecommendations(nextPage);
    };

    // Sağ veya Sol butona basıldığında kaydırma işlemini yapan fonksiyon
    const scroll = (direction) => {
        if (scrollRef.current) {
        const scrollAmount = 800; // Her basışta ne kadar kayacağı (piksel)
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth' // Pürüzsüz (animasyonlu) kayma
        });
        }
    };

    // İskelet yükleme efekti için aynı CSS'i tekrar kullanıyoruz
    const skeletonBoxes = Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx} style={{ flex: '0 0 auto', width: '240px', height: '380px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="skeleton-box" style={{ height: '65%', width: '100%', borderRadius: '0' }}></div>
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', height: '35%', gap: '10px' }}>
            <div className="skeleton-box" style={{ height: '20px', width: '80%' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
            <div className="skeleton-box" style={{ height: '16px', width: '40%' }}></div>
            <div className="skeleton-box" style={{ height: '16px', width: '30%' }}></div>
            </div>
        </div>
        </div>
    ));

    return (
        <div style={{ marginBottom: '50px', position: 'relative' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '24px', margin: 0, color: '#333' }}>⭐ Önerilenler</h3>
            
            {/* Sadece veriler yüklendikten sonra okları göster */}
            {!isLoading && books.length > 0 && (
            <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                onClick={() => scroll('left')} 
                style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                >
                &#8249;
                </button>
                <button 
                onClick={() => scroll('right')} 
                style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                >
                &#8250;
                </button>
            </div>
            )}
        </div>

        {/* Kaydırılabilir Alan (Container) */}
        <div 
            ref={scrollRef}
            style={{ 
            display: 'flex', 
            gap: '30px', 
            overflowX: 'auto', // Yatayda taşanları gizle ve kaydırma çubuğu oluştur
            scrollbarWidth: 'none', // Firefox için çubuğu gizle
            msOverflowStyle: 'none', // IE için çubuğu gizle
            scrollSnapType: 'x mandatory', // Kitapların tam oturmasını sağla
            paddingBottom: '10px' // Gölgenin kesilmemesi için
            }}
        >
            {/* Chrome/Safari için çubuğu gizleyen CSS Hack'i Main.jsx'te style etiketine ekleyeceğiz */}
            
            {isLoading ? skeletonBoxes : books.map((book) => (
            <div key={book.bookID} style={{ flex: '0 0 auto', scrollSnapAlign: 'start' }}>
                <BookCard book={book} onCardClick={onCardClick}/>
            </div>
            ))}

            {/* YENİ: Rafın en sonuna "Daha Fazla Göster" butonu ekliyoruz */}
            {!isLoading && books.length > 0 && hasMore && (
            <div style={{ flex: '0 0 auto', width: '240px', height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', scrollSnapAlign: 'start' }}>
                <button 
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                style={{ 
                    padding: '15px 25px', 
                    borderRadius: '50px', 
                    border: 'none', 
                    backgroundColor: '#686868', 
                    color: '#0b57d0', 
                    cursor: isLoadingMore ? 'wait' : 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease'
                }}
                >
                {isLoadingMore ? 'Yükleniyor...' : '➕ Daha Fazla'}
                </button>
            </div>
            )}

            {!isLoading && books.length === 0 && (
            // Eğer kitap yoksa yapay zekanın mesajını yazıyoruz
            <div style={{ height: '100%', width: '100%', padding: '30px', textAlign: 'center', backgroundColor: '#e9f1fe', borderRadius: '12px', border: '1px dashed #aecbfa' }}>
                <h4 style={{ color: '#0b57d0', margin: '0 0 10px 0', fontSize: '18px' }}>🤖 Yapay Zeka Kütüphanecisi</h4>
                <p style={{ color: '#444', margin: 0 }}>
                {aiMessage || "Şu an için önerilecek kitap bulunamadı."}
                </p>
            </div>
            )}
        </div>

        </div>
    );
    }

export default BookShelf;