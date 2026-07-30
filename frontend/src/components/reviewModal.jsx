import React, { useState, useEffect } from 'react';
import { getBookReviewRequest, addReviewRequest, deleteReviewRequest, updateReviewRequest } from '../services/reviewService';

// Token'ın içinden e-postayı çözen (decode) ufak bir yardımcı fonksiyon
const getEmailFromToken = () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return null;
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload)); // Base64 çözücü
        return decoded.email; 
    } catch (e) {
        return null;
    }
};

function ReviewModal({ isOpen, onClose, book, canWriteReview }) {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form Hafızaları
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    // Güncelleme Modu İçin Hafıza
    const [editingReviewID, setEditingReviewID] = useState(null);

    const currentUserEmail = getEmailFromToken(); // Kimin giriş yaptığını bul

    // KULLANICI BU KİTABA ZATEN YORUM YAPMIŞ MI KONTROLÜ
    const hasReviewed = reviews.some(rev => rev.writes === currentUserEmail);

    // Modal açıldığında yorumları getir
    useEffect(() => {
        if (isOpen && book) {
            fetchReviews();
            // Formu sıfırla
            setRating(5);
            setComment('');
            setEditingReviewID(null);
            setError('');
        }
    }, [isOpen, book]);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const data = await getBookReviewRequest(book.bookID);
            setReviews(data.get_reviews || []);
        } catch (err) {
            console.error("Yorumlar çekilemedi", err);
        } finally {
            setIsLoading(false);
        }
    };

    // YORUM EKLEME VEYA GÜNCELLEME İŞLEMİ
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            if (editingReviewID) {
                // GÜNCELLEME MODU
                await updateReviewRequest(editingReviewID, rating, comment);
            } else {
                // YENİ EKLEME MODU
                await addReviewRequest(book.bookID, rating, comment);
            }
            
            await fetchReviews(); // Listeyi yenile
            setRating(5);         // Formu temizle
            setComment('');
            setEditingReviewID(null); // Güncelleme modundan çık
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // YORUM SİLME İŞLEMİ
    const handleDelete = async (reviewID) => {
        const confirmDelete = window.confirm("Bu yorumu silmek istediğinize emin misiniz?");
        if (!confirmDelete) return;

        try {
            await deleteReviewRequest(reviewID);
            await fetchReviews(); // Silindikten sonra listeyi yenile
        } catch (err) {
            alert("Silme işlemi başarısız: " + err.message);
        }
    };

    // DÜZENLE BUTONUNA BASILINCA FORMUN DOLMASI
    const handleEditClick = (review) => {
        setEditingReviewID(review.reviewID);
        setRating(review.rating);
        setComment(review.comment);
    };

    // GÜNCELLEMEYİ İPTAL ETME
    const handleCancelEdit = () => {
        setEditingReviewID(null);
        setRating(5);
        setComment('');
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
            <div style={{ backgroundColor: '#fff', width: '500px', maxHeight: '80vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                
                {/* MODAL BAŞLIĞI */}
                <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>{book?.title} - Yorumlar</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>✖</button>
                </div>

                {/* YORUMLAR LİSTESİ (KAYDIRILABİLİR ALAN) */}
                <div style={{ padding: '20px', overflowY: 'auto', flex: 1, backgroundColor: '#fafafa' }}>
                    {isLoading ? (
                        <p style={{ textAlign: 'center', color: '#888' }}>Yorumlar yükleniyor...</p>
                    ) : reviews.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#888', fontStyle: 'italic' }}>Bu kitap için henüz yorum yapılmamış.</p>
                    ) : (
                        reviews.map((rev) => (
                            <div key={rev.reviewID} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <strong style={{ color: '#0b57d0' }}>{rev.username}</strong>
                                    <span style={{ color: '#ffb400', fontWeight: 'bold' }}>{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                                </div>
                                <p style={{ margin: 0, color: '#444', fontSize: '14px', lineHeight: '1.5' }}>{rev.comment}</p>
                                
                                {/* EĞER YORUM BİZİMSE DÜZENLE/SİL BUTONLARI ÇIKAR */}
                                {rev.writes === currentUserEmail && (
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                                        {/* SADECE KÜTÜPHANEDEYSEK (canWriteReview) DÜZENLE BUTONU ÇIKSIN */}
                                        {canWriteReview && (
                                            <button 
                                                onClick={() => handleEditClick(rev)}
                                                style={{ background: 'none', border: 'none', color: '#0b57d0', cursor: 'pointer', fontSize: '13px', padding: 0 }}
                                            >
                                                ✏️ Düzenle
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(rev.reviewID)}
                                            style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: '13px', padding: 0 }}
                                        >
                                            🗑️ Sil
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* YORUM YAPMA / GÜNCELLEME FORMU */}
                {canWriteReview && (
                    <div style={{ padding: '20px', borderTop: '1px solid #eee', backgroundColor: '#fff' }}>
                        {/* EĞER YENİ YORUM YAZMIYORSAK VE ZATEN YORUMUMUZ VARSA FORMU GİZLE */}
                        {!editingReviewID && hasReviewed ? (
                            <div style={{ textAlign: 'center', color: '#666', padding: '10px', fontStyle: 'italic' }}>
                                Bu kitabı zaten değerlendirdiniz. Yukarıdan yorumunuzu güncelleyebilir veya silebilirsiniz.
                            </div>
                        ) : (
                            <>
                        <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>
                            {editingReviewID ? '✏️ Yorumunu Güncelle' : '✍️ Sen Ne Düşünüyorsun?'}
                        </h4>
                        
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ fontSize: '14px', color: '#555' }}>Puanın:</label>
                                <select 
                                    value={rating} 
                                    onChange={(e) => setRating(Number(e.target.value))}
                                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                                >
                                    <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                                    <option value="4">⭐⭐⭐⭐ (4)</option>
                                    <option value="3">⭐⭐⭐ (3)</option>
                                    <option value="2">⭐⭐ (2)</option>
                                    <option value="1">⭐ (1)</option>
                                </select>
                            </div>
                            
                            <textarea 
                                placeholder="Kitap hakkında ne düşünüyorsun? (İsteğe bağlı)"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', minHeight: '80px', resize: 'none' }}
                            />
                            
                            {error && <p style={{ color: 'red', margin: 0, fontSize: '13px' }}>{error}</p>}
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    style={{ flex: 1, padding: '10px', backgroundColor: editingReviewID ? '#4caf50' : '#0b57d0', color: 'white', border: 'none', borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                                >
                                    {isSubmitting ? 'İşleniyor...' : (editingReviewID ? 'Değişiklikleri Kaydet' : 'Yorumu Gönder')}
                                </button>
                                
                                {/* GÜNCELLEME MODUNDAYSA İPTAL BUTONU ÇIKAR */}
                                {editingReviewID && (
                                    <button 
                                        type="button"
                                        onClick={handleCancelEdit}
                                        style={{ padding: '10px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        İptal
                                    </button>
                                )}
                            </div>
                        </form>
                        </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReviewModal;