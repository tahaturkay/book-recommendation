import React, { useState } from "react";
import {registerRequest} from "../services/authService";

function Register(){

    // Kullanıcı girdileri burda tutuluyo
    const [username, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(''); // bu sadece ekranda info vermek için

    const handleRegister = async (e) => {
        e.preventDefault();
        
        try{
            const data = await registerRequest(username, email, password);
            setMessage('Kayit basarili');
        }catch(error){
            setMessage('Abu senn hesap olusmadi fln yanlis glb');
            console.error(error);
        }

    }
return (
<div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto'}}>
Register
    {}
    {message && <p style={{ color: 'blue', padding: '10px', background: '#f0f8ff', borderRadius: '5px' }}>{message}</p>}

  {/* Form onSubmit ile tetikleyici fonksiyonumuzu bağlıyoruz */}
    <form onSubmit={handleRegister}>
    
        <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
        {/* 2. KLAVYE DİNLEYİCİSİ: value ve onChange ikilisi */}
            <input 
                type="text" 
                value={username} // Kutunun içindeki yazı = bizim hafızamızdaki email
                onChange={(e) => setUserName(e.target.value)} // Klavyede her tuşa basıldığında hafızayı güncelle
                required 
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
        </div>

        <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
        {/* 2. KLAVYE DİNLEYİCİSİ: value ve onChange ikilisi */}
            <input 
                type="email" 
                value={email} // Kutunun içindeki yazı = bizim hafızamızdaki email
                onChange={(e) => setEmail(e.target.value)} // Klavyede her tuşa basıldığında hafızayı güncelle
                required 
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
        </div>

        <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Şifre:</label>
            <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
        </div>

        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer', background: '#0b57d0', color: 'white', border: 'none', borderRadius: '5px' }}>
            Kayit ol
        </button>
    </form>

</div>


);
}
export default Register;