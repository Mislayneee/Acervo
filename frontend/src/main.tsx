import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import Biblioteca from './Biblioteca.tsx';
import Pesquisa from './Pesquisa.tsx';
import './index.css';
import Perfil from './Perfil.tsx';
import Login from './login';
import Cadastro from './cadastro';
import { AuthProvider } from './AuthContext';
import Contribuir from './Contribuir';
import Sobre from './Sobre';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/biblioteca" element={<Biblioteca />} />
          <Route path="/pesquisa" element={<Pesquisa />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/contribuir" element={<Contribuir />} />
          <Route path="/sobre" element={<Sobre />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
