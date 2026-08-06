import React, { useState } from "react";
import {registerRequest} from "../services/authService";
import { useNavigate } from "react-router-dom";

function Register(){

    // Kullanıcı girdileri burda tutuluyo
    const [username, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(''); // bu sadece ekranda info vermek için

    const navigate = useNavigate(); // navigate fonksiyonu oluşturduk

    const handleRegister = async (e) => {
        e.preventDefault();
        
        try{
            const data = await registerRequest(username, email, password);
            setMessage('Kayit basarili');
            setTimeout(() => {
                navigate('/login'); 
            }, 1500); // 2000 milisaniye = 2 saniye
        }catch(error){
            setMessage('Abu senn hesap olusmadi fln yanlis glb');
            console.error(error);
        }

    }
    const navigateToLogin = async (e) => {
        try{
            navigate('/login');
        } catch(error){
            setMessage("Logine yonlendremedm ozr dlerm");
            console.error(error);
        }
    }
return (
<div style={{ padding: '250px', maxWidth: '250px', margin: '0 auto', background: '#f3f4f1'}}>
    <h1 style={{
        display: 'flex',
        justifyContent: 'center',
        fontSize: "24px",
        color: "#735a2c",
        letterSpacing: "5.5px"
    }}>
        Aramıza Katıl!
    </h1>
    {}
    {message && <p style={{ color: 'blue', padding: '10px', background: '#f0f8ff', borderRadius: '5px' }}>{message}</p>}

  {/* Form onSubmit ile tetikleyici fonksiyonumuzu bağlıyoruz */}
    <form onSubmit={handleRegister}>

        {/* USERNAME bu */}
        <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
        {/* value ve onChange ikilisi */}
            <input 
                type="text" 
                placeholder="crazyboy99"
                value={username} // Kutunun içindeki yazı = bizim hafızamızdaki email
                onChange={(e) => setUserName(e.target.value)} // Klavyede her tuşa basıldığında hafızayı güncelle
                required 
                style={{ width: '100%', padding: '7px', boxSizing: 'border-box' }}
            />
        </div>

        {/* EMAIL bu */}
        <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
        {/* value ve onChange ikilisi */}
            <input 
                type="email" 
                placeholder="madnessmad@xxx.com"
                value={email} // Kutunun içindeki yazı = bizim hafızamızdaki email
                onChange={(e) => setEmail(e.target.value)} // Klavyede her tuşa basıldığında hafızayı güncelle
                required 
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
        </div>

        {/* SIFRE bu */}
        <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Şifre:</label>
            <input 
                type="password" 
                placeholder="don't forget!"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
        </div>

        {/* SUBMIT BUTONU bu */}
        <div style={{display: 'flex', justifyContent: 'center'}}>
            <button 
                type="submit" 
                style={{ fontSize: '15px',padding: '10px 50px', cursor: 'pointer', background: '#0b57d0', color: 'white', border: 'none', borderRadius: '5px' }}>
                Kayıt ol
            </button>
        </div>
    </form>

    <div style={{display: 'flex', justifyContent: 'center', marginTop: '15px'}}>
        <button
            type="submit"
            onClick={navigateToLogin}
            style={{ fontSize: '15px',padding: '10px 50px', cursor: 'pointer', background: '#ffffff', color: 'blue', border: 'none', borderRadius: '5px' }}>
            
            Hesabım var
        </button>
    </div>
</div>


);
}
export default Register;