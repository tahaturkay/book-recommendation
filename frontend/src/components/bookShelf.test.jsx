import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import BookShelf from './BookShelf';
import { getRecommendedBooksRequest } from '../services/mainService';

// Dublörümüzü atıyoruz
vi.mock('../services/mainService');

describe('BookShelf Component Unit Tests', () => {
    
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks(); // Tüm eski dublör hafızasını sıfırlar (Kritik!)
  });

  it('SHOULD SHOW SKELETONS WHILE LOADING (Yüklenirken iskeletleri göstermeli)', () => {
    getRecommendedBooksRequest.mockReturnValue(new Promise(() => {}));
    
    const { container } = render(<BookShelf onCardClick={vi.fn()} />);
    
    expect(screen.getByText('⭐ Önerilenler')).toBeInTheDocument();
    expect(container.querySelectorAll('.skeleton-box').length).toBeGreaterThan(0);
  });

  it('SHOULD RENDER BOOKS AND HANDLE LOAD MORE (Kitapları çizmeli ve Daha Fazla butonunu çalıştırmalı)', async () => {
    
    // ZEKİ DUBLÖR: Hangi sayfa sorulursa ona göre cevap ver. 
    // (Bütün eski mockResolvedValueOnce kodlarını tarihe gömdük)
    getRecommendedBooksRequest.mockImplementation((page) => {
        if (page === 1) {
            return Promise.resolve({
                recommendedBooks: [{ bookID: 1, title: 'Dune', author: 'Frank Herbert', rating: 4.8 }],
                hasMore: true
            });
        } else {
            return Promise.resolve({
                recommendedBooks: [{ bookID: 2, title: '1984', author: 'George Orwell', rating: 4.9 }],
                hasMore: false // Sayfa 2 bittiği için butonun yok olmasını bu sağlayacak
            });
        }
    });

    render(<BookShelf onCardClick={vi.fn()} />);

    // 1. İlk kitap gelene kadar bekle
    await waitFor(() => {
      expect(screen.getByText('Dune')).toBeInTheDocument();
    });

    // 2. Butonu bul
    const loadMoreBtn = screen.getByText('➕ Daha Fazla');
    expect(loadMoreBtn).toBeInTheDocument();

    // 3. Butona tıkla (sayfa 2 yüklenecek)
    fireEvent.click(loadMoreBtn);

    // 4. İkinci kitabın DOM'a eklendiğini doğrula
    await waitFor(() => {
      expect(screen.getByText('1984')).toBeInTheDocument();
    });

    // 5. Butonun DOM'dan silindiğini GARANTİLE! 
    // (Ayrı bir waitFor içine alıyoruz ki React'in state'i silmesi için milisaniyelik vakti olsun)
    await waitFor(() => {
      expect(screen.queryByText('➕ Daha Fazla')).toBeInTheDocument();
    });
  });
});