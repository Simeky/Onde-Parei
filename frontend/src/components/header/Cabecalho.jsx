import { useState } from 'react';

import {
  FaCog,
  FaTimes,
} from 'react-icons/fa';
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import logoOndeParei from '../../assets/Logo_Onde_Parei_outline.webp';
// Importe a função de deletar conta que fizemos no handleUsuarios.js
import { deletarConta } from '../../handleUsuarios';

export default function Cabecalho() {
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [mostrarExcluir, setMostrarExcluir] = useState(false);
  const [senhaConfirmacao, setSenhaConfirmacao] = useState('');
  
  const [usuario, setUsuario] = useState({
    nome: 'Coruja Leitora',
    email: 'coruja@gmail.com',
    provedor: 'local' 
  });

  const navegar = useNavigate();
  const localizacao = useLocation();

  const lidarComLogout = () => {
    localStorage.removeItem('usuarioId');
    navegar('/login');
  };

  const lidarComExclusao = async () => {
    if (usuario.provedor === 'local' && !senhaConfirmacao) {
      return alert("Digite sua senha para confirmar.");
    }
    
    try {
      const id = localStorage.getItem('usuarioId');
      await deletarConta(id);
      lidarComLogout();
    } catch {
      alert("Erro ao excluir conta. Verifique sua senha.");
    }
  };

  return (
    <>
      <nav className="navbar navbar-dark bg-dark border-bottom border-secondary px-4 py-2">
        <div className="d-flex align-items-center">
          <img src={logoOndeParei} alt="Logo" width="40" className="me-3" />
          
          <div className="d-flex gap-4 ms-3">
            <Link to="/busca" className={`text-decoration-none ${localizacao.pathname === '/busca' ? 'text-light fw-bold' : 'text-secondary'}`}>
              Livros
            </Link>
            <Link to="/meus-livros" className={`text-decoration-none ${localizacao.pathname === '/meus-livros' ? 'text-light fw-bold' : 'text-secondary'}`}>
              Meus Livros
            </Link>
          </div>
        </div>

        <button 
          className="btn btn-link text-secondary fs-4" 
          onClick={() => setMostrarConfig(true)}
        >
          <FaCog />
        </button>
      </nav>

      {mostrarConfig && !mostrarExcluir && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
          <div className="card bg-dark text-light border-secondary p-0 shadow-lg" style={{ width: '400px', borderRadius: '12px' }}>
            <div className="d-flex justify-content-between align-items-center border-bottom border-secondary p-3">
              <h5 className="m-0">Configurações</h5>
              <button className="btn btn-link text-secondary p-0" onClick={() => setMostrarConfig(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="p-3 d-flex justify-content-between">
              <div>
                <p className="fw-bold mb-1">{usuario.nome}</p>
                <p className="text-secondary small mb-3">E-mail: <br/>{usuario.email}</p>
              </div>
              
              <div className="d-flex flex-column gap-2" style={{ width: '150px' }}>
                <div className="d-flex justify-content-end align-items-center mb-2 gap-2">
                  <span className="small">Tema</span>
                  <div className="form-check form-switch m-0 p-0">
                    <input className="form-check-input ms-0" type="checkbox" defaultChecked />
                  </div>
                </div>

                <button className="btn btn-outline-secondary btn-sm" onClick={lidarComLogout}>
                  Sair da Conta
                </button>
                <button className="btn btn-outline-danger btn-sm" onClick={() => setMostrarExcluir(true)}>
                  Excluir Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarExcluir && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
          <div className="card bg-dark text-light border-secondary p-4 shadow-lg" style={{ width: '350px', borderRadius: '12px' }}>
            <h5 className="text-danger mb-3">Excluir Conta</h5>
            <p className="small mb-4">Tem certeza? Essa ação apagará todos os seus livros e é <strong>irreversível</strong>.</p>
            
            <div className="mb-4">
              <label className="small text-secondary mb-1">
                Para segurança, digite <br/>
                <strong className="text-light">{usuario.provedor === 'local' ? 'sua senha' : usuario.email}</strong> abaixo:
              </label>
              <input 
                type={usuario.provedor === 'local' ? "password" : "email"}
                className="form-control bg-dark text-light border-secondary"
                placeholder={usuario.provedor === 'local' ? "Sua senha" : "seu-email@gmail.com"}
                value={senhaConfirmacao}
                onChange={(e) => setSenhaConfirmacao(e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-between">
              <button className="btn btn-danger px-3" onClick={lidarComExclusao}>Confirmar Exclusão</button>
              <button className="btn btn-outline-secondary px-3" onClick={() => {
                setMostrarExcluir(false);
                setSenhaConfirmacao('');
              }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}