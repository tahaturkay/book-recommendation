import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LibraryBookCard from './libraryBookCard';
import { removeFromLibraryRequest } from '../services/libraryService';

// Sadece silme servisini mockluyoruz
vi.mock('../services/libraryService', () => ({
    removeFromLibraryRequest: vi.fn()
}));

describe('LibraryBookCard Component', () => {

    const mockBook = {
        bookID: 5, 
        title: "Cesur Yeni Dünya",
        author: "Aldous Huxley",
        rating: 4.7,
        imageURL: ""
    };

    // KART DOĞRU ÇİZİLİYOR MU
    it('should render horizontal library card details correctly', () => {
        render(<LibraryBookCard book={mockBook} />);

        expect(screen.getByText('Cesur Yeni Dünya')).toBeInTheDocument();
        expect(screen.getByText('Aldous Huxley')).toBeInTheDocument();
    });

    // SILME KUTUSUNA TIKLAYINCA SİLME İŞLEMİ (SERVICE) ÇALIŞIYOR MU?
    it('should call removeFromLibraryRequest when trash button is clicked', async () => {
        // onRemove fonksiyonunu da mockluyoruz (sayfadan silme işi)
        const mockOnRemove = vi.fn();

        render(<LibraryBookCard book={mockBook} onRemove={mockOnRemove} />);
        
        // fare kartın üzerine gelince çarpı kutusunu görünür yaptık
        const cardTitle = screen.getByText('Cesur Yeni Dünya');
        const cardContainer = cardTitle.closest('div').parentElement;
        fireEvent.mouseEnter(cardContainer);

        // çarpıyı bul ve tıkla
        const trashButton = screen.getByText('x');
        fireEvent.click(trashButton);

        // removeFromLibraryRequest 5 ID'si ile çağrılmalı!
        expect(removeFromLibraryRequest).toHaveBeenCalledWith(5);

    });
});