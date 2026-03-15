import './MeusLivros.css';

import {
  useEffect,
  useState,
} from 'react';

import logoOutline from '../../assets/Logo_Onde_Parei_outline.webp';
import CartaoBiblioteca
  from '../../components/cardBookMeusLivros/CartaoMeusLivros.jsx';
import Cabecalho from '../../components/header/Cabecalho.jsx';
import ModalEdicaoLivro
  from '../../components/modalMeusLivros/ModalMeusLivros.jsx';
import ModalRemover
  from '../../components/modalRemoverLivro/ModalRemoverLivro.jsx';
import {
  atualizarLivro,
  listarMeusLivros,
  removerLivro,
} from '../../handleLivros';

export default function Biblioteca() {
  const [livros, setLivros] = useState([]);
  const [filtro, setFiltro] = useState('Todos');
  const [carregando, setCarregando] = useState(true);
  
  const [livroSendoEditado, setLivroSendoEditado] = useState(null);
  const [livroParaRemover, setLivroParaRemover] = useState(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 8;

  useEffect(() => {
    carregarBiblioteca();
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtro]);

  const carregarBiblioteca = async () => {
    setCarregando(true);
    try {
      const usuarioId = localStorage.getItem('usuarioId');
      if (usuarioId) {
        const dados = await listarMeusLivros(usuarioId);
        setLivros(dados.reverse());
      }
    } catch (error) {
      console.error("Erro ao carregar a biblioteca", error);
    } finally {
      setCarregando(false);
    }
  };

  const lidarComSalvarEdicao = async (livroAtualizado) => {
    try {
      await atualizarLivro(livroAtualizado.id, {
        paginaAtual: livroAtualizado.paginaAtual,
        anotacao: livroAtualizado.anotacao,
        status: livroAtualizado.status
      });
      
      setLivros(livros.map(l => l.id === livroAtualizado.id ? livroAtualizado : l));
      setLivroSendoEditado(null); 
    } catch {
      alert("Erro ao salvar progresso.");
    }
  };

  const confirmarRemocao = async () => {
    if (!livroParaRemover) return;
    try {
      await removerLivro(livroParaRemover.id);
      setLivros(livros.filter(l => l.id !== livroParaRemover.id));
      setLivroParaRemover(null); 
      setLivroSendoEditado(null); 
      
      if (livrosPaginados.length === 1 && paginaAtual > 1) {
        setPaginaAtual(paginaAtual - 1);
      }
    } catch {
      alert("Erro ao remover o livro.");
    }
  };

  const prepararRemocao = (livro) => {
    setLivroSendoEditado(null); 
    setLivroParaRemover(livro); 
  };

  const livrosFiltrados = livros.filter(livro => {
    if (filtro === 'Todos') return true;
    return livro.status === filtro;
  });

  const totalPaginas = Math.ceil(livrosFiltrados.length / ITENS_POR_PAGINA);
  const startIndex = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const livrosPaginados = livrosFiltrados.slice(startIndex, startIndex + ITENS_POR_PAGINA);

  return (
    <div className="bg-dark text-light min-vh-100 pb-5">
      <Cabecalho />
      
      <main className="container mt-5">
        <div className="d-flex justify-content-between align-items-end mb-4 border-bottom border-secondary pb-3">
          <h2 className="m-0 text-light fw-bold">Meus Livros</h2>
          
          <select 
            className="form-select text-light border-secondary shadow-sm filtro-dropdown" 
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="Para ler">Para ler</option>
            <option value="Lendo">Lendo</option>
            <option value="Lido">Lido</option>
          </select>
        </div>

        {carregando && (
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        )}

        {!carregando && livrosFiltrados.length === 0 && (
          <div className="text-center mt-5 pt-4 text-secondary d-flex flex-column align-items-center">
            <p className="mb-4 fs-5">
               {filtro === 'Todos' ? 'Sua estante está vazia.' : `Nenhum livro com status "${filtro}".`}
            </p>
            <img src={logoOutline} alt="Estante vazia" className="imagem-vazia-biblioteca" />
          </div>
        )}

        {!carregando && livrosFiltrados.length > 0 && (
          <>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
              {livrosPaginados.map((livro) => (
                <div className="col" key={livro.id}>
                  <CartaoBiblioteca 
                    livro={livro} 
                    aoClicar={setLivroSendoEditado} 
                  />
                </div>
              ))}
            </div>

            {totalPaginas > 1 && (
              <div className="d-flex justify-content-center align-items-center mt-5 gap-3 pt-3 border-top border-secondary">
                <button 
                  className="btn btn-outline-secondary rounded-pill px-4 fw-bold"
                  onClick={() => {
                    setPaginaAtual(paginaAtual - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={paginaAtual === 1}
                >
                  Anterior
                </button>
                
                <span className="text-light fw-bold bg-dark border border-secondary rounded-pill px-4 py-2 shadow-sm">
                  Página {paginaAtual} de {totalPaginas}
                </span>
                
                <button 
                  className="btn btn-outline-primary rounded-pill px-4 fw-bold"
                  onClick={() => {
                    setPaginaAtual(paginaAtual + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={paginaAtual === totalPaginas}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {livroSendoEditado && (
        <ModalEdicaoLivro 
          key={livroSendoEditado.id} 
          livro={livroSendoEditado}
          aoSalvar={lidarComSalvarEdicao}
          aoRemover={prepararRemocao}
          aoFechar={() => setLivroSendoEditado(null)}
        />
      )}

      <ModalRemover 
        livro={livroParaRemover}
        aoConfirmar={confirmarRemocao}
        aoCancelar={() => setLivroParaRemover(null)}
      />
    </div>
  );
}