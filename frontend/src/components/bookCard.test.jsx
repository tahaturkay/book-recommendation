import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BookCard from './bookCard';

// kütüphane servislerini mockluyoruz
// çünkü kartın içindeki ekle ve sil fonksiyonları Backend'e istek atıyor
vi.mock('../services/libraryService', () => ({
    addToLibraryRequest: vi.fn(),
}));

describe('BookCard Component', () => {

    const mockBook = {
        bookID: 1,
        title: "Dune",
        author: "Frank Herbert",
        published_year: 1965,
        rating: 4.8,
        imageURL: ""
    };

    // 1. TEST: KART DOĞRU ÇİZİLİYOR MU? (RENDER)
    it('should render book details correctly', () => {
        
        // Sanal ekrana (DOM) bileşeni çiz (Render et)
        render(<BookCard book={mockBook} isLibraryMode={false} />);

        // Beklenti: Ekranda bu yazıları bulabiliyor muyuz? (Tıpkı kullanıcının gözüyle bakar gibi)
        expect(screen.getByText('Dune')).toBeInTheDocument();
        expect(screen.getByText('Frank Herbert')).toBeInTheDocument();
        expect(screen.getByText('1965')).toBeInTheDocument();
        
        screen.debug(); // Ekranda şu an ne çizildiğini terminalde görmek istersen bu yorum satırını açabilirsin!
    });

    
});