import './Cabecalho.css';

import {
  useEffect,
  useState,
} from 'react';

import { FaCog } from 'react-icons/fa';
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import logoOndeParei from '../../assets/Logo_Onde_Parei_outline.webp';
import { buscarUsuarioPorId } from '../../services/handleUsuarios.js';
import ModalConfig from '../modalConfig/ModalConfig.jsx';

export default function Cabecalho() {
  const [modalAtivo, setModalAtivo] = useState(false);
  const [usuario, setUsuario] = useState(null);
  
  const navegar = useNavigate();
  const localizacao = useLocation();

  useEffect(() => {
    let montado = true;

    const carregarUsuario = async () => {
      const id = localStorage.getItem('usuarioId');
      if (id) {
        try {
          const dadosUser = await buscarUsuarioPorId(id);
          if (montado) setUsuario(dadosUser);
        } catch {
          console.error("Erro ao buscar dados do usuário");
        }
      }
    };

    carregarUsuario();
    return () => { montado = false; };
  }, []);

  const lidarComLogout = () => {
    localStorage.removeItem('usuarioId');
    setModalAtivo(false); 
    navegar('/login');
  };

  return (
    <>
      <nav className="navbar navbar-dark bg-body border-bottom border-secondary px-4 py-2">
        <div className="d-flex align-items-center">
          <img src={logoOndeParei} alt="Logo" width="40" className="me-3" />
          
          <div className="d-flex gap-4 ms-3">
            <Link to="/busca" className={`text-decoration-none ${localizacao.pathname === '/busca' ? 'text-body fw-bold' : 'text-secondary'}`}>
              Livros
            </Link>
            <Link to="/meus-livros" className={`text-decoration-none ${localizacao.pathname === '/meus-livros' ? 'text-body fw-bold' : 'text-secondary'}`}>
              Meus Livros
            </Link>
          </div>
        </div>

        <button 
          className="btn btn-link text-secondary fs-4 p-0 btn-configuracao" 
          onClick={() => setModalAtivo(true)}
        >
          <FaCog className="icone-engrenagem" />
        </button>
      </nav>

      {modalAtivo && (
        <ModalConfig 
          usuario={usuario}
          aoFechar={() => setModalAtivo(false)}
          aoLogout={lidarComLogout}
        />
      )}
    </>
  );
}