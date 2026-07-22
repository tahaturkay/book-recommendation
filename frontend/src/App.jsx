import React, { useState } from "react";
import Login from "./pages/login";
import Register from "./pages/register";
import Main from "./pages/main";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return(
    <Router>
      <Routes>
        {/* /login adresinde login gösteriliyor */}
        <Route path="/login" element={<Login />} />
        
        {/* /register adresi */}
        <Route path="/register" element={<Register />} />

        {/* /main adresi */}
        <Route path="/main" element = {<Main />} />
        
      </Routes>
    </Router>
  );
}

export default App;