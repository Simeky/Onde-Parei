import '../modaisConfigStyle/ModaisConfig.css';

import { useState } from 'react';

import { deletarConta } from '../../handleUsuarios.js';

export default function ModalExcluirConta({ usuario, aoCancelar, aoConcluirExclusao }) {
  const [senhaConfirmacao, setSenhaConfirmacao] = useState('');
  const [erro, setErro] = useState('');

  const lidarComConfirmacao = async () => {
    if (usuario.provider === 'local' && !senhaConfirmacao) {
      return setErro("Digite sua senha para confirmar.");
    }
    if (usuario.provider === 'google' && senhaConfirmacao !== usuario.email) {
      return setErro("O e-mail digitado não confere.");
    }
    
    try {
      await deletarConta(usuario.id, { senha: senhaConfirmacao, provider: usuario.provider });
      alert("Conta excluída permanentemente.");
      aoConcluirExclusao();
    } catch {
      setErro("Erro ao excluir conta. Verifique sua senha.");
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center modal-config-overlay-darker">
      <div className="card text-light border-secondary p-4 shadow-lg modal-config-content" style={{ width: '380px' }}>
        <h5 className="text-danger mb-3">Excluir Conta</h5>
        <p className="small mb-4 text-secondary">
          Tem certeza? Essa ação apagará todos os seus livros e é <strong>irreversível</strong>.
        </p>
        
        {erro && <div className="alert alert-danger py-2 small">{erro}</div>}
        
        <div className="mb-4">
          <label className="small text-secondary mb-1">
            Para segurança, digite <br/>
            <strong className="text-light">{usuario.provider === 'local' ? 'sua senha' : usuario.email}</strong> abaixo:
          </label>
          <input 
            type={usuario.provider === 'local' ? "password" : "email"}
            className="form-control text-light border-secondary modal-config-input"
            placeholder={usuario.provider === 'local' ? "Sua senha" : "seu-email@gmail.com"}
            value={senhaConfirmacao}
            onChange={(e) => setSenhaConfirmacao(e.target.value)}
          />
        </div>

        <div className="d-flex justify-content-between">
          <button className="btn btn-danger px-3" onClick={lidarComConfirmacao}>Confirmar Exclusão</button>
          <button className="btn btn-outline-secondary px-3" onClick={aoCancelar}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}