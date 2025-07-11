import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import Biblioteca from './Biblioteca.tsx';
import Pesquisa from './Pesquisa.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/pesquisa" element={<Pesquisa />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
