import { useState } from 'react';

import logoOutline from '../../assets/Logo_Onde_Parei_outline.webp';
import CartaoLivro from '../../components/cardBookSearch/CartaoBusca.jsx';
import Cabecalho from '../../components/header/Cabecalho.jsx';
import { buscarLivrosApiExterna } from '../../handleAPILivros';
import { adicionarLivro } from '../../handleLivros';

export default function Busca() {
  const [pesquisa, setPesquisa] = useState('');
  const [livros, setLivros] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const lidarComPesquisa = async (e) => {
    e.preventDefault();
    if (!pesquisa) return;
    
    setCarregando(true);
    const resultados = await buscarLivrosApiExterna(pesquisa);
    setLivros(resultados);
    setCarregando(false);
  };

  const lidarComAdicionarLivro = async (livro) => {
    try {
      const usuarioId = localStorage.getItem('usuarioId');
      const dadosParaSalvar = {
        usuario_id: usuarioId,
        id_api: livro.id_api,
        titulo: livro.titulo,
        autor: livro.autor,
        capa: livro.capa
      };

      await adicionarLivro(dadosParaSalvar);
      alert(`O livro "${livro.titulo}" foi adicionado à sua biblioteca!`);
    } catch {
      alert("Erro ao adicionar livro. Tente novamente.");
    }
  };

  return (
    <div className="bg-dark text-light min-vh-100 pb-5">
      <Cabecalho />
      
      <main className="container mt-5">
        <form onSubmit={lidarComPesquisa} className="d-flex justify-content-center mb-5">
          <div className="input-group shadow-sm" style={{ maxWidth: '600px' }}>
            <input 
              type="text" 
              className="form-control bg-dark text-light border-secondary" 
              placeholder="Pesquisar por Título ou Autor..." 
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
            />
            <button type="submit" className="btn btn-primary px-4" disabled={carregando}>
              {carregando ? 'Buscando...' : 'Pesquisar'}
            </button>
          </div>
        </form>

        <h3 className="mb-4 text-secondary border-bottom border-secondary pb-2">Resultados da Pesquisa</h3>

        {carregando && (
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-secondary">Procurando no acervo...</p>
          </div>
        )}

        {!carregando && livros.length === 0 && (
          <div className="text-center mt-5 text-secondary d-flex flex-column align-items-center">
            <p className="mb-4">Utilize a pesquisa acima para encontrar livros.</p>
            <img src={logoOutline} alt="Coruja de fundo" width="350" style={{ opacity: 0.1 }} />
          </div>
        )}

        {!carregando && livros.length > 0 && (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
            {livros.map((livro) => (
              <div className="col" key={livro.id_api}>
                <CartaoLivro livro={livro} acaoAdicionar={lidarComAdicionarLivro} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}