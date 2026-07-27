async function addToLibraryRequest(bookID) {

    try {
    
    const token = localStorage.getItem('jwt_token');
    if (!token) throw new Error("Giriş yapılmamış.");

    // backende selam veriyoz burda
    const response = await fetch('http://localhost:3000/api/library/add', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json', // Backend'e "Sana JSON yolluyorum" diyoruz
        'Authorization': `Bearer ${token}` 
        },
        // Hafızadaki verileri JSON paketine koyup gönderiyoruz
        body: JSON.stringify({ 
        bookID: bookID, 
        }),
    });
    // backendin selamını alıyoruz
    const data = await response.json();

    if (response.ok) { // status 200 ise
        return data; // gelen cevabı returnluyoruz
    } else {
        // durum başaramadık abi ise
        setMessage('Hata: ' + (data.error || 'Giriş yapılamadı'));
    }
} catch(error){
    setMessage('Problem oldu abi');
}
}

// 1. Kütüphanedeki Kitapları Getirme (Read)
async function getMyLibraryRequest() {
    try {
        const token = localStorage.getItem('jwt_token');
        if (!token) throw new Error("Giriş yapılmamış.");

        const response = await fetch('http://localhost:3000/api/library/display', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Kütüphane getirilemedi');
        }

        // Backend "books_owners" adında dönüyordu (libraryController.js'ye göre)
        return data.books_owners; 
    } catch (error) {
        throw error;
    }
}

// 2. Kütüphaneden Kitap Silme (Delete)
async function removeFromLibraryRequest(bookID) {
    try {
        const token = localStorage.getItem('jwt_token');
        if (!token) throw new Error("Giriş yapılmamış.");

        // URL'ye parametre olarak bookID ekliyoruz (Backend'de req.params.bookID ile almıştın)
        const response = await fetch(`http://localhost:3000/api/library/remove/${bookID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Kitap silinemedi');
        }

        return data; 
    } catch (error) {
        throw error;
    }
}

export { addToLibraryRequest, getMyLibraryRequest, removeFromLibraryRequest };