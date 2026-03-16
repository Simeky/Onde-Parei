import '../modaisConfigStyle/ModaisConfig.css';

import { useState } from 'react';

import { atualizarSenha } from '../../services/handleUsuarios.js';

export default function ModalAlterarSenha({ usuario, aoCancelar }) {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');

  const lidarComSubmit = async (e) => {
    e.preventDefault();
    
    if (novaSenha !== confirmarSenha) {
      return setErro("As senhas não coincidem.");
    }

    const regexMaiuscula = /[A-Z]/;
    const regexMinuscula = /[a-z]/;
    const regexNumero = /[0-9]/;
    const regexEspecial = /[^A-Za-z0-9]/;

    if (
      novaSenha.length < 8 || 
      !regexMaiuscula.test(novaSenha) || 
      !regexMinuscula.test(novaSenha) || 
      !regexNumero.test(novaSenha) || 
      !regexEspecial.test(novaSenha)
    ) {
      return setErro('A senha não atende aos requisitos mínimos de segurança.');
    }
    
    try {
      await atualizarSenha(usuario.id, novaSenha);
      alert("Senha alterada com sucesso!");
      aoCancelar(); 
    } catch {
      setErro("Erro ao alterar a senha. Tente novamente.");
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center modal-config-overlay bg-dark bg-opacity-50">
      <div className="card text-body border-secondary p-4 shadow-lg modal-config-content modal-alterar-senha-content">
        <h5 className="mb-4 text-center">Alterar Senha</h5>
        
        {erro && <div className="alert alert-danger py-2 small">{erro}</div>}

        <form onSubmit={lidarComSubmit}>
          <div className="mb-3">
            <label className="small text-secondary mb-1">Nova Senha:</label>
            <input 
              type="password"
              className="form-control text-body border-secondary modal-config-input"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label className="small text-secondary mb-1">Confirmar Nova Senha:</label>
            <input 
              type="password"
              className="form-control text-body border-secondary modal-config-input"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
            />
          </div>

          <div className="text-secondary small mb-4">
            A senha deve conter pelo menos:
            <ul className="list-unstyled ms-3 mt-1 mb-0">
              <li>- 8 dígitos;</li>
              <li>- 1 letra maiúscula;</li>
              <li>- 1 letra minúscula;</li>
              <li>- 1 número;</li>
              <li>- 1 caractere especial.</li>
            </ul>
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