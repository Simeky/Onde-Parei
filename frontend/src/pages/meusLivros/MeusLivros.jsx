import { useState, useEffect } from 'react';

import Cabecalho from '../../components/header/Cabecalho.jsx';
import CartaoLivro from '../../components/cardBookSearch/CartaoBusca.jsx';
import { listarMeusLivros, removerLivro } from '../../handleLivros.js';
import { buscarDetalhesLivro } from '../../handleAPILivros.js';

export default function MeusLivros() {
    const [livros, setLivros] = useState([]);
    const [carregando, setCarregando] = useState(false);

    // detalhes/descrição exibidos ao clicar
    const [livroSelecionado, setLivroSelecionado] = useState(null);
    const [detalhes, setDetalhes] = useState(null);
    const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

    useEffect(() => {
        const usuarioId = localStorage.getItem('usuarioId');
        if (!usuarioId) return;

        setCarregando(true);
        listarMeusLivros(usuarioId)
            .then((dados) => setLivros(dados))
            .catch(() => {
                alert('Erro ao carregar seus livros.');
            })
            .finally(() => setCarregando(false));
    }, []);

    const lidarRemover = async (livro) => {
        if (!window.confirm(`Remover "${livro.titulo}" da sua biblioteca?`)) return;
        try {
            await removerLivro(livro.id);
            setLivros(livros.filter((l) => l.id !== livro.id));
        } catch {
            alert('Não foi possível remover o livro.');
        }
    };

    const lidarClique = async (livro) => {
        setLivroSelecionado(livro);
        setDetalhes(null);
        if (livro.id_api) {
            setCarregandoDetalhes(true);
            const d = await buscarDetalhesLivro(livro.id_api);
            setDetalhes(d);
            setCarregandoDetalhes(false);
        }
    };

    const fecharModal = () => {
        setLivroSelecionado(null);
        setDetalhes(null);
    };

    return (
        <div className="bg-dark text-light min-vh-100 pb-5">
            <Cabecalho />
            <main className="container mt-4">
                <h1>Meus Livros</h1>

                {carregando && (
                    <div className="text-center mt-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-2 text-secondary">Carregando sua biblioteca...</p>
                    </div>
                )}

                {!carregando && livros.length === 0 && (
                    <p className="text-secondary mt-4">
                        Você ainda não adicionou nenhum livro. Visite a página de busca para começar!
                    </p>
                )}

                {!carregando && livros.length > 0 && (
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
                        {livros.map((livro) => (
                            <div className="col" key={livro.id}>
                                <CartaoLivro
                                  livro={livro}
                                  acaoRemover={lidarRemover}
                                  onClick={() => lidarClique(livro)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* modal de detalhes */}
            {livroSelecionado && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                     style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}
                     onClick={fecharModal}>
                    <div className="card bg-dark text-light border-secondary p-4" style={{ maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
                        <button className="btn-close btn-close-white float-end" onClick={fecharModal}></button>
                        {livroSelecionado.capa && (
                            <div className="text-center mb-3">
                                <img
                                    src={livroSelecionado.capa}
                                    alt={`Capa de ${livroSelecionado.titulo}`}
                                    style={{ maxHeight: '200px', borderRadius: '8px' }}
                                />
                            </div>
                        )}
                        <h5 className="mb-3">{livroSelecionado.titulo}</h5>
                        <p className="mb-1"><strong>Autor:</strong> {livroSelecionado.autor}</p>
                        <p className="mb-1"><strong>Ano:</strong> {livroSelecionado.ano || (detalhes && detalhes.first_publish_date) || 'N/A'}</p>
                        {carregandoDetalhes && <p>Carregando detalhes...</p>}
                        {!carregandoDetalhes && detalhes && detalhes.description && (
                            <div className="mt-3">
                                <strong>Descrição:</strong>
                                <p className="small mt-1">
                                    {typeof detalhes.description === 'string'
                                        ? detalhes.description
                                        : detalhes.description.value}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}