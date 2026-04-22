import './ModalRemoverLivro.css';

import { useState } from 'react';

import { removerLivro } from '../../services/handleLivros.js';

export default function ModalRemover({ livro, aoConcluirRemocao, aoCancelar }) {
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  if (!livro) return null;

  const Confirmacao = async () => {
    setCarregando(true);
    try {
      await removerLivro(livro.id);
      aoConcluirRemocao(livro.id);
    } 
    catch {
      setErro("Erro ao remover o livro.");
    }
    setCarregando(false);
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 modal-remover-overlay">
      <div className="card text-body bg-body border-secondary p-4 shadow-lg modal-remover-content">
        <h5 className="mb-3 text-danger">Remover de Meus Livros</h5>
        <p className="small mb-4 text-secondary">
          Tem certeza que deseja remover <strong>{livro.titulo}</strong> da seus livros? Você perderá as suas anotações e a página em que parou.
        </p>

        {erro && <div className="alert alert-danger py-2 small">{erro}</div>}

        <div className="d-flex justify-content-between mt-2">
          <button className="btn btn-danger px-4" onClick={Confirmacao} disabled={carregando}>
            {carregando ? 'Removendo...' : 'Remover'}
          </button>
          <button className="btn btn-outline-secondary px-4 border-secondary" onClick={aoCancelar} disabled={carregando}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}