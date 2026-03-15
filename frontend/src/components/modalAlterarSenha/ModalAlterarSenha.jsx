import '../modaisConfigStyle/ModaisConfig.css';

import { useState } from 'react';

import { atualizarSenha } from '../../handleUsuarios.js';

export default function ModalAlterarSenha({ usuario, aoCancelar }) {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');

  const lidarComSubmit = async (e) => {
    e.preventDefault();
    if (!novaSenha || novaSenha.length < 4) return setErro("A senha deve ter pelo menos 4 caracteres.");
    if (novaSenha !== confirmarSenha) return setErro("As senhas não coincidem.");
    
    try {
      await atualizarSenha(usuario.id, novaSenha);
      alert("Senha alterada com sucesso!");
      aoCancelar(); 
    } catch {
      setErro("Erro ao alterar a senha. Tente novamente.");
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center modal-config-overlay-darker">
      <div className="card text-light border-secondary p-4 shadow-lg modal-config-content" style={{ width: '350px' }}>
        <h5 className="mb-4 text-center">Alterar Senha</h5>
        
        {erro && <div className="alert alert-danger py-2 small">{erro}</div>}

        <form onSubmit={lidarComSubmit}>
          <div className="mb-3">
            <label className="small text-secondary mb-1">Nova Senha:</label>
            <input 
              type="password"
              className="form-control text-light border-secondary modal-config-input"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="small text-secondary mb-1">Confirmar Nova Senha:</label>
            <input 
              type="password"
              className="form-control text-light border-secondary modal-config-input"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
            />
          </div>

          <div className="d-flex justify-content-between">
            <button type="submit" className="btn btn-primary px-3">Salvar</button>
            <button type="button" className="btn btn-outline-secondary px-3" onClick={aoCancelar}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}