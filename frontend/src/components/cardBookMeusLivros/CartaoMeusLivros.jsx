import './CartaoMeusLivros.css'; // Importando o CSS modular do componente

import capaPadrao from '../../assets/Logo_Onde_Parei_outline.webp';

export default function CartaoMeusLivros({ livro, aoClicar }) {
  const obterCorBadge = (status) => {
    switch (status) {
      case 'Lendo': return 'bg-warning text-dark';
      case 'Lido': return 'bg-success text-white';
      case 'Para ler':
      default: return 'bg-primary text-white';
    }
  };

  return (
    <div 
      className="card book-card h-100 bg-body text-body border-secondary position-relative p-3" 
      onClick={() => aoClicar(livro)}
    >
      <span 
        className={`badge ${obterCorBadge(livro.status)} badge-status position-absolute top-0 start-0 m-2 px-2 py-1 shadow-sm`}
      >
        {livro.status}
      </span>

      <img 
        src={livro.capa || capaPadrao} 
        className="card-img-top book-cover" 
        alt={`Capa do livro ${livro.titulo}`} 
      />
      
      <div className="card-body px-0 pb-0 d-flex flex-column">
        <h5 className="card-title fw-bold mb-1 text-truncate" title={livro.titulo}>{livro.titulo}</h5>
        <p className="card-text text-secondary small mb-1 text-truncate">Autor: {livro.autor}</p>
        
        <div className="mt-auto pt-2 border-top border-secondary">
          <p className="card-text small mb-1">Ano: {livro.ano} | Pág. onde parei: {livro.paginaAtual || 0}</p>
          <p className="card-text text-secondary small text-truncate mb-0">{livro.categoria || 'Geral'}</p>
        </div>
      </div>
    </div>
  );
}