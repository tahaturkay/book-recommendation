import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'; // VİTEST İÇE AKTARIMLARI
import ReviewModal from './reviewModal';
import { getBookReviewRequest, addReviewRequest, deleteReviewRequest } from '../services/reviewService';

// jest.mock yerine vi.mock
vi.mock('../services/reviewService');

describe('ReviewModal Component Unit Tests', () => {
    const mockBook = { bookID: 10, title: 'Yüzüklerin Efendisi' };
    
    beforeAll(() => {
        // 1. JWT Token Mock
        const mockToken = 'sahteHeader.eyJlbWFpbCI6InRlc3RAdmlwLmNvbSJ9.sahteImza';
        Storage.prototype.getItem = vi.fn(() => mockToken);
        
        // 2. Silme işlemi için window.confirm mocklaması
        window.confirm = vi.fn(() => true);
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('SHOULD NOT RENDER IF ISOPEN IS FALSE (isOpen false ise ekrana çizilmemeli)', () => {
        const { container } = render(<ReviewModal isOpen={false} book={mockBook} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('SHOULD FETCH REVIEWS AND SHOW EDIT/DELETE BUTTONS ONLY FOR OWNER (Yorumları getirmeli ve butonları sadece sahibine göstermeli)', async () => {
        
        const mockReviews = [
        { reviewID: 1, username: 'Ahmet', comment: 'Sıkıcıydı', rating: 2, writes: 'ahmet@vip.com' },
        { reviewID: 2, username: 'TestUser', comment: 'Efsane bir kitap', rating: 5, writes: 'test@vip.com' }
        ];
        
        getBookReviewRequest.mockResolvedValueOnce({ get_reviews: mockReviews });

        // onCardClick veya onClose gibi yerlere vi.fn() koyuyoruz
        render(<ReviewModal isOpen={true} book={mockBook} canWriteReview={true} onClose={vi.fn()} />);

        expect(screen.getByText('Yüzüklerin Efendisi - Yorumlar')).toBeInTheDocument();

        await waitFor(() => {
        expect(screen.getByText('Sıkıcıydı')).toBeInTheDocument();
        expect(screen.getByText('Efsane bir kitap')).toBeInTheDocument();
        });

        const editButtons = screen.getAllByText('✏️ Düzenle');
        const deleteButtons = screen.getAllByText('🗑️ Sil');
        
        expect(editButtons.length).toBe(1); 
        expect(deleteButtons.length).toBe(1);
        
        expect(screen.getByText(/Bu kitabı zaten değerlendirdiniz/i)).toBeInTheDocument();
    });

    it('SHOULD SUBMIT NEW REVIEW IF USER HAS NO REVIEW (Kullanıcının yorumu yoksa yeni yorum formunu çalıştırmalı)', async () => {
        getBookReviewRequest.mockResolvedValueOnce({ get_reviews: [] }); 
        addReviewRequest.mockResolvedValueOnce({}); 
        
        getBookReviewRequest.mockResolvedValueOnce({ 
        get_reviews: [{ reviewID: 3, username: 'TestUser', comment: 'Yeni yorumum!', rating: 4, writes: 'test@vip.com' }] 
        });

        render(<ReviewModal isOpen={true} book={mockBook} canWriteReview={true} onClose={vi.fn()} />);

        await waitFor(() => {
        expect(screen.getByText('Bu kitap için henüz yorum yapılmamış.')).toBeInTheDocument();
        });

        const textarea = screen.getByPlaceholderText('Kitap hakkında ne düşünüyorsun? (İsteğe bağlı)');
        fireEvent.change(textarea, { target: { value: 'Yeni yorumum!' } });

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '4' } });

        const submitBtn = screen.getByText('Yorumu Gönder');
        fireEvent.click(submitBtn);

        await waitFor(() => {
        expect(addReviewRequest).toHaveBeenCalledWith(10, 4, 'Yeni yorumum!');
        });
    });
});