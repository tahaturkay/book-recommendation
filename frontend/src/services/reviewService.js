// REVIEW GORME ISTEGI GONDERME 
async function getBookReviewRequest(bookID) {

    try {
    
    const token = localStorage.getItem('jwt_token');
    if (!token) throw new Error("Giriş yapılmamış.");

    // backende selam veriyoz burda
    const response = await fetch(`http://localhost:3000/api/reviews/get-reviews/${bookID}`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json', // Backend'e "Sana JSON yolluyorum" diyoruz
        'Authorization': `Bearer ${token}` 
        },
    });

    // backendin selamını alıyoruz
    const data = await response.json();

    if (response.ok) { // status 200 ise
        return data; // gelen cevabı returnluyoruz
    } else {
        // durum başaramadık abi ise
        throw new Error(data.error || 'Yorumlar getirilemedi');
    }
} catch(error){
    setMessage('Problem oldu abi');
}
}

// REVIEW EKLEME ISTEGI GONDERME 
async function addReviewRequest(bookID, rating, comment) {
    try {
        const token = localStorage.getItem('jwt_token');
        if (!token) throw new Error("Giriş yapılmamış.");

        const response = await fetch(`http://localhost:3000/api/reviews/add-reviews/${bookID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ 
            rating: rating,
            comment: comment
        })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Yorum eklenemedi');
        }

        return data; 
    } catch (error) {
        throw error;
    }
}

// REVIEW GUNCELLEME ISTEGI GONDERME 
async function updateReviewRequest(reviewID, rating, comment) {
    try {
        const token = localStorage.getItem('jwt_token');
        if (!token) throw new Error("Giriş yapılmamış.");

        // URL'ye parametre olarak bookID ekliyoruz (Backend'de req.params.bookID ile almıştın)
        const response = await fetch(`http://localhost:3000/api/reviews/update-reviews/${reviewID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ 
            rating: rating,
            comment: comment
        })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Yorum güncellenemedi');
        }

        return data; 
    } catch (error) {
        throw error;
    }
}

// REVIEW SILME ISTEGI GONDERME 
async function deleteReviewRequest(reviewID) {
    try {
        const token = localStorage.getItem('jwt_token');
        if (!token) throw new Error("Giriş yapılmamış.");

        // URL'ye parametre olarak bookID ekliyoruz (Backend'de req.params.bookID ile almıştın)
        const response = await fetch(`http://localhost:3000/api/reviews/delete-reviews/${reviewID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Yorum silinemedi');
        }

        return data; 
    } catch (error) {
        throw error;
    }
}

export { getBookReviewRequest, addReviewRequest, updateReviewRequest, deleteReviewRequest };