
async function loginRequest(email, password){
  try {
    // backende selam veriyoz burda
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Backend'e "Sana JSON yolluyorum" diyoruz
    },
    // Hafızadaki verileri JSON paketine koyup gönderiyoruz
    body: JSON.stringify({ 
      email: email, 
      password: password 
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

} catch (error) {
  // direkt sunucusal problem varsa
  setMessage('Sunucuya bağlanılamadı. Node.js açık mı?');
}
}

async function registerRequest(username, email, password){
  try {
    // backende selam veriyoz burda
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Backend'e "Sana JSON yolluyorum" diyoruz
    },
    // Hafızadaki verileri JSON paketine koyup gönderiyoruz
    body: JSON.stringify({ 
      username: username,
      email: email, 
      password: password 
    }),
  });

  // backendin selamını alıyoruz
  const data = await response.json();

  if (response.ok) { // status 201 ise
    return data; // gelen cevabı returnluyoruz
  } else {
    // durum başaramadık abi ise
    setMessage('Hata: ' + (data.error || 'Kayit yapilamadi'));
  }

} catch (error) {
  // direkt sunucusal problem varsa
  setMessage('Sunucuya bağlanılamadı. Node.js açık mı?');
}
}
export {registerRequest, loginRequest};