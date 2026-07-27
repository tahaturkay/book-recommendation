import React, { useState } from 'react';
import { removeFromLibraryRequest } from '../services/libraryService';

function LibraryBookCard({ book, onRemove }) {
    const [isHovered, setIsHovered] = useState(false);

    // Kütüphaneden Silme Fonksiyonu
    const handleRemove = async (e) => {
        e.stopPropagation();
        try {
            await removeFromLibraryRequest(book.bookID);
            // Silme başarılıysa Main.jsx'teki listeye haber ver (ekrandan kaybolsun)
            if (onRemove) {
                onRemove(book.bookID);
            }
        } catch (error) {
            alert('Silinemedi: ' + error.message);
            console.error("Kitap silinirken hata:", error);
        }
    };

    return (
        <div 
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '10px', 
                backgroundColor: isHovered ? '#fff' : 'transparent', 
                borderRadius: '8px', 
                transition: 'all 0.2s ease',
                boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                width: '100%', // Genişliğin dışına çıkmasını engeller
                boxSizing: 'border-box'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            
            {/* SOL KISIM: Küçük Kapak Fotoğrafı */}
            <div style={{ flex: '0 0 50px', height: '75px', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flexShrink: 0 }}>
                <img 
                    src={book.imageURL || 'https://images.unsplash.com/vector-1739806775494-6e1a49ff3135?q=80&w=1180&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'} 
                    alt={book.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>

            {/* ORTA KISIM: Kitap Bilgileri */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: "hidden" }}>
                {/* Kitap Adı: Max 2 satır, sonra 3 nokta (...) */}
                <h4 style={{ 
                    margin: '0 0 4px 0', 
                    fontSize: '13px', 
                    color: '#333', 
                    display: '-webkit-box',
                    WebkitLineClamp: 2, // En fazla 2 satır gösterir
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.2'
                }}>
                    {book.title}
                </h4>
                <span style={{ fontSize: '12px', color: '#666', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {book.author}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f9ab00' }}>
                    ⭐ {book.rating || '0.0'}
                </span>
            </div>

            {/* SAĞ KISIM: Hover olunca çıkan Çöp Kutusu */}
            <div style={{ flex: '0 0 30px', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                {isHovered && (
                <button 
                    onClick={handleRemove}
                    style={{ 
                        background: 'none', 
                        border: 'none', 
                        fontSize: '18px', 
                        cursor: 'pointer', 
                        color: '#dc3545',
                        padding: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.1s',
                        opacity: isHovered ? 1 : 0, // DÜZEN KAYMASINI ENEGELLER!
                        visibility: isHovered ? 'visible' : 'hidden',
                        transform: isHovered ? 'scale(1)' : 'scale(0.8)'
                    }}
                    title="Kütüphaneden Çıkar"
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    x
                </button>
            )}
            </div>
            
        </div>
    );
}

export default LibraryBookCard;