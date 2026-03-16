import './CartaoBusca.css';

import { FaCheck } from 'react-icons/fa';

import capaPadrao from '../../assets/Logo_Onde_Parei_outline.webp';

export default function CartaoLivro({ livro, livroNaBiblioteca, acaoAdicionar, acaoRemover }) {
  const isAdicionado = !!livroNaBiblioteca;

  return (
    <div className="card book-card h-100 bg-body text-body border-secondary p-3">
      <img
        src={livro.capa ? livro.capa : capaPadrao}
        className="card-img-top book-cover rounded"
        alt={`Capa do livro ${livro.titulo}`}
      />

      <div className="card-body px-0 pb-0 d-flex flex-column">
        <h5 className="card-title fw-bold mb-1 text-truncate" title={livro.titulo}>{livro.titulo}</h5>
        <p className="card-text text-secondary small mb-1 text-truncate">Autor: {livro.autor}</p>

        <div className="mt-auto pt-2 border-top border-secondary">
          <p className="card-text small mb-1">Ano: {livro.ano ? String(livro.ano).substring(0, 4) : 'N/A'} | Pág: {livro.paginas || 0}</p>
          <p className="card-text text-secondary small text-truncate mb-3">{livro.categoria || 'Geral'}</p>

          {isAdicionado ? (
            <button
              className="btn btn-success w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
              onClick={() => acaoRemover(livroNaBiblioteca)}
            >
              Adicionado <FaCheck />
            </button>
          ) : (
            <button
              className="btn btn-primary w-100 fw-bold"
              onClick={() => acaoAdicionar(livro)}
            >
              Adicionar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}