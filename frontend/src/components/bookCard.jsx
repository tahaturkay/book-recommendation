import React, { useState } from 'react';

function bookCard({ book }) { // book parametresi ile backendden gelen kitabı alıyor
const [isHovered, setIsHovered] = useState(false); // hover durumu kontrol(kart üstü)

// Kütüphaneye ekle butonuna basılınca çalışacak fonksiyon
const handleAddToLibrary = (e) => {
e.stopPropagation(); // Kartın başka bir tıklama özelliğini (örn: detaya gitme) tetiklemesini engeller
// TODO: İleride burada backend'e istek atacağız

};

return (
<div
style={{
position: 'relative',
width: '100%',
maxWidth: '240px',
height: '300px',
backgroundColor: '#fff',
borderRadius: '12px',
boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.2)' : '0 4px 8px rgba(0,0,0,0.1)',
overflow: 'hidden',
display: 'flex',
flexDirection: 'column',
transition: 'all 0.3s ease',
cursor: 'pointer', // imleç şekli
transform: isHovered ? 'translateY(-5px)' : 'translateY(0)' // hover durumunda hafif yukarı kalkıyo
}}
onMouseEnter={() => setIsHovered(true)}
onMouseLeave={() => setIsHovered(false)}
>

  {/* Kapak Fotoğrafı ve Hover Butonu */}
  <div style={{ position: 'relative', height: '65%', width: '100%' }}>
    <img 
      src={book.imageURL || 'https://images.unsplash.com/vector-1739806775494-6e1a49ff3135?q=80&w=1180&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'} 
      alt={book.title} 
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />

    {/* Hover olduğunda çıkan (+) Kütüphaneye Ekle Butonu */}
    {isHovered && (
      <button 
        onClick={handleAddToLibrary}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '35px',
          height: '35px',
          borderRadius: '50%',
          backgroundColor: '#0b57d0',
          color: 'white',
          border: 'none',
          fontSize: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
          title: 'Kütüphaneme Ekle'
        }}
      >
        +
      </button>
    )}
  </div>

  {/* Kitap Bilgileri */}
  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '35%' }}>
    
    {/* Kitap Adı (Uzunsa 3 nokta ile keseriz) */}
    <h3 style={{ 
      margin: '0 0 5px 0', 
      fontSize: '16px', 
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }}>
      {book.title}
    </h3>

    {/* Alt Bilgi Satırı (Sol ve Sağ olarak ikiye bölüyoruz) */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
      
      {/* Sol Alt: Yıl ve Yazar */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>
          {book.published_year}
        </span>
        <span style={{ fontSize: '13px', color: '#333', fontWeight: '500' }}>
          {book.author}
        </span>
      </div>

      {/* Sağ Alt: Puan ve İnceleme Sayısı */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#f9ab00', display: 'flex', alignItems: 'center' }}>
          ⭐ {book.rating || '0.0'}
        </span>
        <span style={{ fontSize: '11px', color: '#888' }}>
          ({book.numRatings || 0} oy)
        </span>
      </div>

    </div>
  </div>

</div>


);
}

export default bookCard;