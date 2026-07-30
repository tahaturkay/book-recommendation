import React, { useState, useEffect } from 'react';
import { getBookReviewRequest, addReviewRequest } from '../services/reviewService';

export default function ReviewModal({ isOpen, onClose, book, canWriteReview }) {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && book) {
            fetchReviews();
        } else {
            setReviews([]);
            setNewRating(5);
            setNewComment('');
            setError('');
        }
    }, [isOpen, book]);

    const fetchReviews = async () => {
        setIsLoading(true);
        setError('');
        try {
            // Gerçek Backend'den (Senin postacın aracılığıyla) yorumları çekiyoruz!
            const data = await getBookReviewRequest(book.bookID);
            setReviews(data.get_reviews || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            // Gerçek Backend'e (Senin postacın aracılığıyla) yorum ekliyoruz!
            await addReviewRequest(book.bookID, newRating, newComment);
            
            // Yorum başarıyla eklendiyse, sayfayı yenilemeden kullanıcının yorumunu en üste ekle
            const newReviewObj = {
                username: "Sen", // Gerçekte token'dan veya user state'inden gelir
                rating: newRating,
                comment: newComment
            };
            setReviews(prev => [newReviewObj, ...prev]);

            setNewComment('');
            setNewRating(5);
            alert("Yorumunuz başarıyla eklendi! 🎉");
        } catch (err) {
            alert("Yorum eklenirken hata oluştu: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !book) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            
            <div style={{
                backgroundColor: '#fff', borderRadius: '16px',
                width: '90%', maxWidth: '600px', maxHeight: '85vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)', overflow: 'hidden'
            }} onClick={(e) => e.stopPropagation()}> 

                <div style={{
                    padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '20px', color: '#333' }}>{book.title}</h2>
                        <span style={{ fontSize: '13px', color: '#666' }}>{book.author}</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999', padding: '0 5px' }}>✖</button>
                </div>

                <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                    {isLoading && <p style={{ textAlign: 'center', color: '#666' }}>Yorumlar yükleniyor...</p>}
                    {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                    {!isLoading && !error && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {reviews.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                                    <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>💬</span>
                                    Bu kitap için henüz yorum yapılmamış. İlk yorumu sen yap!
                                </div>
                            ) : (
                                reviews.map((review, index) => (
                                    <div key={index} style={{
                                        padding: '15px', backgroundColor: '#f4f7f6',
                                        borderRadius: '12px', border: '1px solid #e0e0e0'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <strong style={{ color: '#0b57d0' }}>@{review.username}</strong>
                                            <span style={{ color: '#f9ab00', fontWeight: 'bold' }}>⭐ {review.rating}</span>
                                        </div>
                                        <p style={{ margin: 0, color: '#444', fontSize: '14px', lineHeight: '1.5' }}>
                                            {review.comment}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {canWriteReview && (
                    <div style={{ padding: '20px', borderTop: '1px solid #eee', backgroundColor: '#fff' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Kendi Değerlendirmeni Ekle</h4>
                        <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Puanın:</label>
                                <select 
                                    value={newRating} 
                                    onChange={(e) => setNewRating(Number(e.target.value))}
                                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none', color: '#333' }}
                                >
                                    <option value={5}>⭐⭐⭐⭐⭐ (5) Harika</option>
                                    <option value={4}>⭐⭐⭐⭐ (4) Çok İyi</option>
                                    <option value={3}>⭐⭐⭐ (3) Ortalama</option>
                                    <option value={2}>⭐⭐ (2) Kötü</option>
                                    <option value={1}>⭐ (1) Berbat</option>
                                </select>
                            </div>
                            <textarea 
                                placeholder="Kitap hakkında ne düşünüyorsun?" value={newComment} onChange={(e) => setNewComment(e.target.value)} required rows="3"
                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', resize: 'none', fontFamily: 'inherit', outline: 'none', color: '#333' }}
                            />
                            <button type="submit" disabled={isSubmitting || !newComment.trim()} style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: (isSubmitting || !newComment.trim()) ? '#ccc' : '#0b57d0', color: 'white', fontWeight: 'bold', cursor: (isSubmitting || !newComment.trim()) ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}>
                                {isSubmitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
                            </button>
                        </form>
                    </div>
                )}
                
                {!canWriteReview && (
                    <div style={{ padding: '15px', borderTop: '1px solid #eee', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
                        <span style={{ fontSize: '13px', color: '#666' }}>Yorum yapabilmek için bu kitabı önce kütüphanenize eklemelisiniz.</span>
                    </div>
                )}
            </div>
        </div>
    );
}