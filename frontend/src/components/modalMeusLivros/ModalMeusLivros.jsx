import './ModalMeusLivros.css';

import { useState } from 'react';

import { FaTimes } from 'react-icons/fa';

export default function ModalEdicaoLivro({ livro, aoSalvar, aoRemover, aoFechar }) {
  const [paginaAtual, setPaginaAtual] = useState(livro?.paginaAtual || 0);
  const [anotacao, setAnotacao] = useState(livro?.anotacao || '');
  const [status, setStatus] = useState(livro?.status || 'Para ler');

  if (!livro) return null;

  const lidarComSalvar = () => {
    const totalPaginas = parseInt(livro.paginas, 10) || 0;
    let novoPaginaAtual = parseInt(paginaAtual, 10);

    if (isNaN(novoPaginaAtual) || novoPaginaAtual < 0) {
      alert('Página inválida!');
      return;
    }
    if (totalPaginas > 0 && novoPaginaAtual > totalPaginas) {
      alert(`A página não pode ser maior que o total do livro (${totalPaginas})!`);
      return;
    }

    let novoStatus = status;
    if (novoPaginaAtual > 0 && status === 'Para ler') {
      novoStatus = 'Lendo';
    }
    if (novoPaginaAtual === 0 && status === 'Lendo') {
      novoStatus = 'Para ler';
    }
    if (totalPaginas > 0 && novoPaginaAtual === totalPaginas) {
      novoStatus = 'Lido';
    }

    aoSalvar({ ...livro, paginaAtual: novoPaginaAtual, anotacao, status: novoStatus });
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 modal-overlay bg-dark bg-opacity-50">
      <div className="card text-body border-secondary p-0 shadow-lg position-relative modal-content-custom bg-body">
        <button 
          className="btn btn-link text-secondary position-absolute top-0 end-0 m-3 p-0 btn-close-custom" 
          onClick={aoFechar}
        >
          <FaTimes size={20}/>
        </button>
        
        <div className="row g-0 p-4 mt-2">
          <div className="col-12 col-md-5 text-center mb-4 mb-md-0 d-flex align-items-center justify-content-center pe-md-4">
             <img 
               id="modalBookCover" 
               src={livro.capa} 
               alt={`Capa de ${livro.titulo}`} 
               className="rounded img-fluid" 
             />
          </div>
          
          <div className="col-12 col-md-7 d-flex flex-column justify-content-between pt-2">
            <div>
              <h4 className="fw-bold mb-1 pe-4">{livro.titulo}</h4>
              <p className="text-secondary mb-3 small">{livro.autor}</p>
              <p className="text-secondary mb-4 small">Total de Páginas: {livro.paginas || 'Desconhecido'}</p>

              <div className="mb-3">
                <label className="form-label text-secondary small mb-1">Status</label>
                <select 
                  className="form-select text-body border-secondary bg-body" 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Para ler">Para ler</option>
                  <option value="Lendo">Lendo</option>
                  <option value="Lido">Lido</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small mb-1">Página onde parei:</label>
                <input 
                  type="number" 
                  className="form-control text-body border-secondary bg-body" 
                  value={paginaAtual}
                  onChange={(e) => setPaginaAtual(e.target.value)}
                  min="0"
                  max={livro.paginas || ""}
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small mb-1">Observações:</label>
                <textarea 
                  className="form-control text-body border-secondary bg-body" 
                  rows="3"
                  placeholder="Ex: Parou no capítulo 3..."
                  value={anotacao}
                  onChange={(e) => setAnotacao(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="d-flex flex-wrap justify-content-between gap-2 mt-2">
              <button className="btn btn-danger px-4 flex-grow-1 flex-md-grow-0" onClick={() => aoRemover(livro)}>Remover</button>
              <button className="btn btn-success px-4 flex-grow-1 flex-md-grow-0" onClick={lidarComSalvar}>Salvar Progresso</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}