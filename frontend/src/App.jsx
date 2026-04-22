import { useEffect } from 'react';

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import BemVindo from './pages/bemVindo/BemVindo.jsx';
import Busca from './pages/busca/Busca.jsx';
import Cadastro from './pages/cadastro/Cadastro.jsx';
import Login from './pages/login/login.jsx';
import MeusLivros from './pages/meusLivros/MeusLivros.jsx';

function App() {
  useEffect(() => {
    const temaSalvo = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-bs-theme', temaSalvo);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BemVindo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/busca" element={<Busca />} />
        <Route path="/meus-livros" element={<MeusLivros />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;