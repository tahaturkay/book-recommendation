import React, { useState } from "react";
import Login from "./pages/login";
import Register from "./pages/register";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return(
    <Router>
      <Routes>
        {/* Kullanıcı /login adresine giderse Login sayfasını göster */}
        <Route path="/login" element={<Login />} />
        
        {/* Kullanıcı /register adresine giderse Register sayfasını göster */}
        <Route path="/register" element={<Register />} />
        
        {/* Ana sayfaya (/) gelirse şimdilik doğrudan login'e yönlendir (Navigate) */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;