import { FaPlus, FaTrash } from 'react-icons/fa';

import capaPadrao
  from '../../assets/Logo_Onde_Parei_outline.webp'; // Uma capa caso o livro não tenha imagem

export default function CartaoLivro({ livro, acaoAdicionar, acaoRemover, onClick }) {
  // decide qual botão de ação renderizar (adição ou remoção)
  const actionButton = acaoAdicionar ? (
    <button 
      className="btn btn-primary position-absolute top-0 end-0 m-2 rounded-circle shadow"
      onClick={(e) => {
        e.stopPropagation();
        acaoAdicionar(livro);
      }}
      title="Adicionar à Biblioteca"
      style={{ width: '40px', height: '40px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <FaPlus />
    </button>
  ) : acaoRemover ? (
    <button 
      className="btn btn-danger position-absolute top-0 end-0 m-2 rounded-circle shadow"
      onClick={(e) => {
        e.stopPropagation();
        acaoRemover(livro);
      }}
      title="Remover da Biblioteca"
      style={{ width: '40px', height: '40px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <FaTrash />
    </button>
  ) : null;

  return (
    <div
      onClick={onClick}
      className="card bg-dark text-light border-secondary h-100 shadow-sm position-relative"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {actionButton}

      <img 
        src={livro.capa ? livro.capa : capaPadrao} 
        className="card-img-top p-2" 
        alt={`Capa do livro ${livro.titulo}`} 
        style={{ height: '250px', objectFit: livro.capa ? 'cover' : 'contain', borderRadius: '12px' }}
      />
      
      <div className="card-body d-flex flex-column">
        <h6 className="card-title fw-bold mb-1">{livro.titulo}</h6>
        <p className="card-text text-secondary small mb-1">{livro.autor}</p>
        {livro.status && (
          <p className="card-text text-secondary small mb-1">Status: {livro.status}</p>
        )}
        {livro.paginaAtual !== undefined && (
          <p className="card-text text-secondary small mb-2">Páginas: {livro.paginaAtual}</p>
        )}
        <p className="card-text text-secondary small mt-auto">Ano: {livro.ano || 'N/A'}</p>
      </div>
    </div>
  );
}