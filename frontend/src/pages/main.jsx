import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // farklı sayfaya yönlendirme
import BookCard from '../components/bookCard';
import BookShelf from '../components/bookShelf';
import LibraryBookCard from '../components/libraryBookCard';
import { getBooksRequest, getCategoriesRequest } from '../services/mainService';
import { getMyLibraryRequest, removeFromLibraryRequest } from '../services/libraryService';
import ReviewModal from '../components/reviewModal'; 


// fonksiyon adı büyük başlamak zorundaymış yoksa html tag falan sanıyomuş galiba react
function Main() { 
    // kitap ve ana sayfa bilgileri hafızaları
    const [books, setBooks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // default sayfa 1
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // search için hafızalar
    const [searchInput, setSearchInput] = useState(''); 
    const [activeSearch, setActiveSearch] = useState(''); 

    // sol taraftaki kategoriler için hafıza
    const [categories, setCategories] = useState([]); 
    const [activeCategory, setActiveCategory] = useState(''); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

    // sağdaki kütüphane için hafızalar
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [libraryBooks, setLibraryBooks] = useState([]);
    const [isLibraryLoading, setIsLibraryLoading] = useState(false);

    // review modal için hafızalar
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedBookForReview, setSelectedBookForReview] = useState(null);
    const [canWriteReview, setCanWriteReview] = useState(false);

    const navigate = useNavigate();

    // KART TIKLANINCA ÇALIŞACAK FONKSİYON
    const handleCardClick = (book, fromLibrary = false) => {
        setSelectedBookForReview(book);
        setCanWriteReview(fromLibrary);
        setIsReviewModalOpen(true);
    };

    // kategorileri çekme
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategoriesRequest();
                setCategories(data.categories);
            } catch (err) {
                console.error("Kategoriler çekilemedi:", err);
            }
        };
        fetchCategories();
    }, []);

    // kitapları çekme
    useEffect(() => {
        const fetchBooks = async () => {
            setIsLoading(true);
            setError('');
            try {
                const data = await getBooksRequest(currentPage, activeSearch, activeCategory);
                setBooks(data.books);
                setTotalPages(data.totalPages);
            } catch (err) {
                setError(err.message);
                if (err.message.includes('Token')) {
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchBooks();
    }, [currentPage, activeSearch, activeCategory, navigate]); 

    // Sadece kitaplık açıldıysa çalışan KİTAPLIĞI çekme işlemi
    useEffect(() => {
        if (isLibraryOpen) {
            const fetchLibrary = async () => {
                setIsLibraryLoading(true);
                try {
                    const myBooks = await getMyLibraryRequest();
                    setLibraryBooks(myBooks);
                } catch (err) {
                    console.error("Kütüphane yüklenemedi:", err);
                    if (err.message.includes('Giriş') || err.message.includes('Token')) {
                        navigate('/login');
                    }
                } finally {
                    setIsLibraryLoading(false);
                }
            };
            fetchLibrary();
        }
    }, [isLibraryOpen, navigate]);

    // Kütüphaneden kitap silindiğinde anında ekrandan kaybetme
    const handleLibraryBookRemoved = (removedBookID) => {
        setLibraryBooks((prevBooks) => prevBooks.filter(book => book.bookID !== removedBookID));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault(); 
        setCurrentPage(1); 
        setActiveSearch(searchInput); 
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
    
            {/* SIDEBAR açılınca arkası kararıyo */}
            {(isSidebarOpen || isLibraryOpen) && (
                <div 
                    onClick={() => { setIsSidebarOpen(false); setIsLibraryOpen(false); }}   
                    style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }}
                ></div>
            )}

            {/* KATEGORİ soldaki bar */}
            <div style={{ 
                position: 'fixed', top: 0, 
                left: isSidebarOpen ? '0' : '-300px', 
                width: '260px', height: '100vh', backgroundColor: '#fff', boxShadow: '2px 0 10px rgba(0,0,0,0.2)', 
                zIndex: 1000, transition: 'left 0.3s ease', overflowY: 'auto', padding: '20px'
            }}>
                {/* ÜST yazı kısmı */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ margin: 0, color: '#0b57d0' }}>Kategoriler</h2>
                    {/* X butonu */}
                    <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', backgroundColor: '#ffaaaa', color: 'white',  border: 'none', fontSize: '15px', cursor: 'pointer' }}>x</button>
                </div>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li 
                            onClick={() => { setActiveCategory(''); setIsSidebarOpen(false); setCurrentPage(1); }}
                            style={{ padding: '12px', cursor: 'pointer', borderRadius: '8px', marginBottom: '5px', transition: '0.2s', backgroundColor: activeCategory === '' ? '#f0f4f9' : 'transparent', fontWeight: activeCategory === '' ? 'bold' : 'normal', color: activeCategory === '' ? '#0b57d0' : '#333' }}
                        >
                            Tüm Kitaplar
                        </li>
                    {/* seçilen kategoriyi açıyor, sidebarı kapatıyor, sayfayı 1'e çekiyor */}
                    {categories.map((cat, idx) => (
                        <li 
                            key={idx} 
                            onClick={() => { setActiveCategory(cat); setIsSidebarOpen(false); setCurrentPage(1); }}
                            style={{ padding: '12px', cursor: 'pointer', borderRadius: '8px', marginBottom: '5px', transition: '0.2s', backgroundColor: activeCategory === cat ? '#f0f4f9' : 'transparent', fontWeight: activeCategory === cat ? 'bold' : 'normal', color: activeCategory === cat ? '#0b57d0' : '#555' }}
                        >
                            {cat}
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* KÜTÜPHANE sağdaki bar */}
            <div style={{ 
                position: 'fixed', top: 0, right: isLibraryOpen ? '0' : '-350px', 
                width: '300px', height: '100vh', backgroundColor: '#f8f9fa', boxShadow: '-2px 0 15px rgba(0,0,0,0.3)', 
                zIndex: 1000, transition: 'right 0.3s ease', overflowY: 'auto', padding: '20px',
                display: 'flex', flexDirection: 'column'
            }}>
                {/* üstteki yazı */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#333' }}>Kütüphanem</h2>
                    <button onClick={() => setIsLibraryOpen(false)} style={{ background: 'none', backgroundColor: '#ffaaaa', color: 'white',  border: 'none', fontSize: '15px', cursor: 'pointer' }}>x</button>
                </div>
                
                <hr style={{ border: 'none', borderTop: '1px solid #ddd', marginBottom: '20px' }} />

                {/* kütüphane yükleniyorsa */}
                {isLibraryLoading && <p style={{ textAlign: 'center', color: '#666' }}>Rafların tozu alınıyor...</p>}
                
                {/* yükleme işlemi bittiyse ve kütüphanede kitap yoksa */}
                {!isLibraryLoading && libraryBooks.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
                        <p style={{ fontSize: '40px', margin: '0 0 10px 0' }}>📭</p>
                        <p>Kütüphanen bomboş</p>
                        <p style={{ fontSize: '13px' }}>Hemen vitrinden kitap ekle!</p>
                    </div>
                )}

                {/* yükleme işlemi bittiyse ve kütüphanede kitap varsa */}
                {!isLibraryLoading && libraryBooks.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', paddingBottom: '30px' }}>
                        {libraryBooks.map((book) => (
                            // LibraryBookCard kullanıyoruz
                            <LibraryBookCard 
                                key={book.bookID} 
                                book={book}
                                onRemove={handleLibraryBookRemoved}
                                onCardClick={(book) => handleCardClick(book, true)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                
                {/* KATEGORI butonu */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#333' }} title="Kategoriler">
                        ☰
                    </button>
                    <h2 style={{ margin: 10 }}>📚 Aktaşlar Sahafcılık</h2>
                </div>

                {/* SEARCH formu */}
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
                    
                    {activeSearch && (
                        <button type="button" onClick={() => { setSearchInput(''); setActiveSearch(''); setCurrentPage(1); }} style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#567dbb', color: 'white', cursor: 'pointer' }}>
                            Temizle
                        </button>
                    )}
                </form>
                
                {/* KÜTÜPHANE butonu */}
                <button type="button" onClick={() => setIsLibraryOpen(true) } style={{ padding: '10px 15px', borderRadius: '8px', border: 'none', backgroundColor: '#333', color: 'white', cursor: 'pointer' }}>
                    Kütüphanemi Aç
                </button>
            </div>
            {/* HEADER BİTTİ */}
            
            {/* ISKELET YÜKLEME KEYFRAMELERİ */}
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
                .hide-scroll::-webkit-scrollbar {
                    display: none;
                }
                `}
            </style>
    
            {/* ÖNERİLENLER RAFI (Sadece arama ve kategori seçilmediğinde görünür) */}
            {!activeSearch && !activeCategory && <BookShelf onCardClick={(book) => handleCardClick(book, false)} />}
            
            {/* önerilenler ile kitaplar arasındaki çizgi */}
            <hr style={{ border: 'none', borderTop: '1px solid #eee', marginBottom: '30px' }} />
            
            {/* arama sonucu veya default yazı */}
            <h3 style={{ fontSize: '24px', margin: '0 0 20px 0', color: '#333' }}>
                {activeSearch ? `"${activeSearch}" arama sonuçları` : (activeCategory ? ` ${activeCategory} Kitapları` : 'Tüm Kitaplar')}
            </h3>
        
            {/* İSKELET YÜKLEME EKRANI */}
            {isLoading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px', marginBottom: '40px' }}>
                    {Array.from({ length: 8 }).map((_, index) => ( // 8 tane iskelet kutu oluşturuyoruz
                        <div key={index} style={{ width: '100%', maxWidth: '240px', height: '380px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            {/* Fotoğraf iskeleti %65 */}
                            <div className="skeleton-box" style={{ height: '65%', width: '100%', borderRadius: '0' }}></div>
                            {/* Alt tarafın iskeleti %35 */}
                            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', height: '35%', gap: '10px' }}>
                                {/* kitabın adının iskeleti */}
                                <div className="skeleton-box" style={{ height: '20px', width: '80%' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                                    {/* sol alt taraftaki iskeletler */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '50%' }}>
                                        {/* yayım yılının iskeleti */}
                                        <div className="skeleton-box" style={{ height: '12px', width: '40%' }}></div>
                                        {/* yazar iskeleti */}
                                        <div className="skeleton-box" style={{ height: '16px', width: '80%' }}></div>
                                    </div>
                                    {/* sağ alttaki iskeletler */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '30%', alignItems: 'flex-end' }}>
                                        {/* yıldız ve ratingin iskeleti */}
                                        <div className="skeleton-box" style={{ height: '16px', width: '100%' }}></div>
                                        {/* yapılan review sayısının iskeleti */}
                                        <div className="skeleton-box" style={{ height: '12px', width: '60%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* error alırsak onu yazıyoruz */}
            {error && <p style={{ color:'red' }}>Hata: {error}</p>} 

            {/* KİTAPLAR IZGARASI */}
            {!isLoading && !error && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '30px' }}>
                    {books.map((book) => (
                        <BookCard 
                            key={book.bookID} 
                            book={book}
                            onCardClick={(book) => handleCardClick(book, false)}
                        />
                    ))}
                </div>
            )}

            {/* SAYFALAMA KONTROLLERİ yani paging */}
            {!isLoading && !error && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                    <button 
                        onClick={handlePrevPage} 
                        disabled={currentPage === 1}
                        style={{ padding: '8px 16px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', borderRadius: '5px', border: '1px solid #ccc' }}
                    >
                        &lt; {/* düz yapınca html cozutuyo */}
                    </button>
                    
                    <span style={{ fontWeight: 'bold', color: '#555' }}>
                        Sayfa {currentPage} / {totalPages}
                    </span>

                    <button 
                        onClick={handleNextPage} 
                        disabled={currentPage === totalPages}
                        style={{ padding: '8px 16px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', borderRadius: '5px', border: '1px solid #ccc' }}
                    >
                        &gt;
                    </button>
                </div>
            )}
            {/* MODAL BİLEŞENİ EN ALTA EKLENİYOR */}
            <ReviewModal 
                isOpen={isReviewModalOpen} 
                onClose={() => setIsReviewModalOpen(false)} 
                book={selectedBookForReview} 
                canWriteReview={canWriteReview} 
            />
        </div>
    );
}

export default Main; // büyük m olmayınca react bunu html tagı sanıyomuş