import React, { useState } from "react";
import {loginRequest} from "../services/authService";
import { useNavigate } from "react-router-dom"; // bunun sayesinde başka sayfaya atıyo (burdan maine fırlıycaz)

function Login(){

    // Kullanıcı girdileri burda tutuluyo hafıza oluşturuyoz
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(''); // bu sadece ekranda info vermek için

    const navigate = useNavigate(); // navigate fonksiyonu oluşturduk
    
    const handleLogin = async (e) => {
        e.preventDefault();
        
        try{
            const data = await loginRequest(email,password);
            localStorage.setItem('jwt_token', data.generatedToken); // gelen cevabın içinden tokeni ayrıştırıyoruz
            setMessage("Abii girdiler abiiii");
            setTimeout(() => {
                navigate('/main'); 
            }, 500); // 500 milisaniye = 0.5 saniye
        }catch(error){
            setMessage(error.message);
            console.error(error);
        }
    }
    const navigateToRegister = async(e) => {
        try{
            navigate('/register');
        }catch(error){
            setMessage("registere yonlendiremedm ozr dlerm");
            console.error(error);
        }
    }
return (
<div style={{padding: '250px', maxWidth: '250px', margin: '0 auto', background: '#f3f4f1'}}>
    <h1 style={{
        display: 'flex',
        justifyContent: 'center',
        fontSize: "24px",
        color: "#735a2c",
        letterSpacing: "5.5px"
    }}>
        Hoş Geldiniz
    </h1>
    {}
    {message && <p style={{ color: 'blue', padding: '10px', background: '#f0f8ff', borderRadius: '5px' }}>{message}</p>}

  {/* Form onSubmit ile tetikleyici fonksiyonu bağladık */}
    <form onSubmit={handleLogin}>

        {/* EMAIL kutusu bu */}
        <div style={{ marginBottom: '15px',marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px'}}>Email:</label>
        {/* value ve onChange ikilisi */}
            <input 
                type="email" // bu type sayesinde @ işaretli bişi bekliyo
                placeholder="örnek_email@xxx.com"
                value={email} // Kutunun içindeki yazı = bizim hafızamızdaki email
                onChange={(e) => setEmail(e.target.value)} // Klavyede her tuşa basıldığında hafızayı güncelle
                required // eksik girilip submite basıcna error fırlattırıyo 
                style={{ width: '100%', padding: '7px', boxSizing: 'border-box' }}
            />
        </div>

        {/* SIFRE kutusu bu */}
        <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Şifre:</label>
            <input 
                type="password" // bu type sayesinde gözükmüyo arayüzde
                value={password} 
                placeholder="Şifre (hadi bakmıyorum)"
                onChange={(e) => setPassword(e.target.value)} 
                required // girmeden submitleyince abi doldur diyo
                style={{ width: '100%', padding: '7px', boxSizing: 'border-box' }}
            />
        </div>

        {/* SUBMIT BUTONU bu */}
        <div style={{display: 'flex', justifyContent: 'center'}}>
            <button 
                type="submit"
                style={{fontSize: '15px',padding: '10px 50px', cursor: 'pointer', background: '#0b57d0', color: 'white', border: 'none', borderRadius: '5px' }}>
                Giriş
        </button>
        </div>
        
    </form>

        {/* HESABIM YOK BUTONU bu */}
        <div style={{display: 'flex', justifyContent: 'center', marginTop: "10px"}}>
            <button 
                type="submit"
                onClick={navigateToRegister}
                style={{fontSize: '15px',padding: '10px 50px', cursor: 'pointer', background: '#ffffff', color: 'blue', border: 'none', borderRadius: '5px' }}>
            Hesabım yok
        </button>
        </div>


</div>


);
}
export default Login;