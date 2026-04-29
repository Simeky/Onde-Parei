import './Busca.css';

import {
  useEffect,
  useState,
} from 'react';

import logoOutline from '../../assets/Logo_Onde_Parei_outline.webp';
import CartaoLivro from '../../components/cardBookSearch/CartaoBusca.jsx';
import Cabecalho from '../../components/header/Cabecalho.jsx';
import ModalRemover
  from '../../components/modalRemoverLivro/ModalRemoverLivro.jsx';
import {
  adicionarLivro,
  listarMeusLivros,
} from '../../services/handleLivros.js';
import { buscarLivrosApiExterna } from './handleAPILivros.js';

export default function Busca() {
  const [pesquisa, setPesquisa] = useState('');
  const [livros, setLivros] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [minhaBiblioteca, setMinhaBiblioteca] = useState([]);
  const [livroParaRemover, setLivroParaRemover] = useState(null);
  
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [temMaisResultados, setTemMaisResultados] = useState(false);

  useEffect(() => {
    let Montado = true; 
    const carregarMinhaBiblioteca = async () => {
      try {
        const usuarioId = localStorage.getItem('usuarioId');
        if (usuarioId) {
          const livrosSalvos = await listarMeusLivros(usuarioId);
          if (Montado) setMinhaBiblioteca(livrosSalvos);
        }
      } catch {
        console.error("Erro ao carregar a biblioteca do usuário");
      }
    };
    carregarMinhaBiblioteca();
    
    return () => {
      Montado = false;
    };
  }, []);

  const realizarBuscaNaApi = async (termoPesquisa, numeroPagina) => {
    setCarregando(true);
    const startIndex = (numeroPagina - 1) * 12; 
    
    const resultados = await buscarLivrosApiExterna(termoPesquisa, startIndex);
    
    setLivros(resultados);
    setTemMaisResultados(resultados.length === 12); 
    setCarregando(false);
  };

  const lidarComPesquisa = async (e) => {
    e.preventDefault();
    if (!pesquisa) return;
    
    setPaginaAtual(1); 
    await realizarBuscaNaApi(pesquisa, 1);
  };

  const mudarPagina = async (novaPagina) => {
    setPaginaAtual(novaPagina);
    await realizarBuscaNaApi(pesquisa, novaPagina);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const lidarComAdicionarLivro = async (livro) => {
    try {
      const usuarioId = localStorage.getItem('usuarioId');
      const dadosParaSalvar = {
        usuario_id: usuarioId,
        id_api: livro.id_api,
        titulo: livro.titulo,
        autor: livro.autor,
        capa: livro.capa,
        paginas: livro.paginas, 
        ano: livro.ano ? String(livro.ano).substring(0, 4) : 'N/A',
        categoria: livro.categoria
      };

      const resposta = await adicionarLivro(dadosParaSalvar);
      setMinhaBiblioteca([...minhaBiblioteca, resposta.livro]);
    } catch {
      alert("Erro ao adicionar livro.");
    }
  };

  const concluirRemocao = (idRemovido) => {
    setMinhaBiblioteca(minhaBiblioteca.filter(l => l.id !== idRemovido));
    setLivroParaRemover(null);
  };

  return (
    <div className="bg-body text-body min-vh-100 pb-5">
      <Cabecalho />
      
      <main className="container mt-5">
        <form onSubmit={lidarComPesquisa} className="d-flex justify-content-center mb-5">
          <div className="input-group shadow-sm busca-input-container">
            <input 
              type="text" 
              className="form-control bg-body text-body border-secondary" 
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
          </div>
        )}

        {!carregando && livros.length === 0 && (
          <div className="text-center mt-5 text-secondary d-flex flex-column align-items-center">
            <p className="mb-4">Utilize a pesquisa acima para encontrar livros.</p>
            <img src={logoOutline} alt="Coruja de fundo" width="350" className="busca-coruja-fundo" />
          </div>
        )}

        {!carregando && livros.length > 0 && (
          <>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
              {livros.map((livroGoogle) => {
                const livroSalvo = minhaBiblioteca.find(l => l.id_api === livroGoogle.id_api);
                return (
                  <div className="col" key={livroGoogle.id_api}>
                    <CartaoLivro 
                      livro={livroGoogle} 
                      livroNaBiblioteca={livroSalvo} 
                      acaoAdicionar={lidarComAdicionarLivro} 
                      acaoRemover={setLivroParaRemover} 
                    />
                  </div>
                );
              })}
            </div>

            <div className="d-flex justify-content-center align-items-center mt-5 gap-3 pt-3 border-top border-secondary">
              <button 
                className="btn btn-outline-secondary rounded-pill px-4 fw-bold"
                onClick={() => mudarPagina(paginaAtual - 1)}
                disabled={paginaAtual === 1}
              >
                Anterior
              </button>
              
              <span className="text-body fw-bold bg-body border border-secondary rounded-pill px-4 py-2 shadow-sm">
                Página {paginaAtual}
              </span>
              
              <button 
                className="btn btn-outline-primary rounded-pill px-4 fw-bold"
                onClick={() => mudarPagina(paginaAtual + 1)}
                disabled={!temMaisResultados}
              >
                Próxima
              </button>
            </div>
          </>
        )}
      </main>

      <ModalRemover 
        livro={livroParaRemover} 
        aoConcluirRemocao={concluirRemocao} 
        aoCancelar={() => setLivroParaRemover(null)} 
      />
    </div>
  );
}