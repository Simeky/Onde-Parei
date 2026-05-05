import '../modaisConfigStyle/ModaisConfig.css';

import { useState } from 'react';

import { FaTimes } from 'react-icons/fa';

import ModalAlterarSenha from '../modalAlterarSenha/ModalAlterarSenha.jsx';
import ModalExcluirConta from '../modalExcluirConta/ModalExcluirConta.jsx';

export default function ModalConfig({ usuario, aoFechar, aoLogout }) {
  const [subModalAberto, setSubModalAberto] = useState(null);
  
  const [temaEscuro, setTemaEscuro] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  const alternarTema = () => {
    const novoTema = temaEscuro ? 'light' : 'dark';
    setTemaEscuro(!temaEscuro);
    localStorage.setItem('theme', novoTema);
    document.documentElement.setAttribute('data-bs-theme', novoTema);
  };

  if (!usuario) {
    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center modal-config-overlay">
        <div className="spinner-border text-body" role="status"></div>
      </div>
    );
  }

  if (subModalAberto === 'senha') {
    return <ModalAlterarSenha usuario={usuario} aoCancelar={() => setSubModalAberto(null)} />;
  }

  if (subModalAberto === 'excluir') {
    return <ModalExcluirConta usuario={usuario} aoCancelar={() => setSubModalAberto(null)} aoConcluirExclusao={aoLogout} />;
  }

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center modal-config-overlay bg-dark bg-opacity-50">    
      <div className="card border-secondary p-0 shadow-lg modal-config-content">
        <div className="d-flex justify-content-between align-items-center border-bottom border-secondary p-3">
          <h5 className="m-0">Configurações</h5>
          <button className="btn btn-link text-secondary p-0" onClick={aoFechar}>
            <FaTimes />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4 text-center">
            <p className="fs-6 m-0">Email: {usuario.email}</p>
          </div>
          
          <div className="d-flex flex-column gap-2">
            <div className="d-flex justify-content-between align-items-center mb-3 p-2 rounded border border-secondary bg-body ">
              <span className="small">Tema Escuro</span>
              <div className="form-check form-switch m-0 p-0">
                <input 
                  className="form-check-input ms-0" 
                  type="checkbox" 
                  checked={temaEscuro} 
                  onChange={alternarTema} 
                />
              </div>
            </div>

            {usuario.provider === 'local' && (
              <button className="btn btn-outline-secondary btn-sm mb-2" onClick={() => setSubModalAberto('senha')}>
                Alterar Senha
              </button>
            )}

            <button className="btn btn-outline-secondary btn-sm" onClick={aoLogout}>
              Sair da Conta
            </button>
            <button className="btn btn-outline-danger btn-sm mt-2" onClick={() => setSubModalAberto('excluir')}>
              Excluir Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}