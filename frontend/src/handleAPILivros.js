import axios from 'axios';

export const buscarLivrosApiExterna = async (termo) => {
  try {
    const resposta = await axios.get(`https://openlibrary.org/search.json`, {
      params: {
        q: termo,
        limit: 12, // Traz 12 resultados por vez
        language: 'por' // Tenta priorizar português
      }
    });
    
    const livrosFormatados = resposta.data.docs.map(livro => ({
      id_api: livro.key,
      titulo: livro.title,
      autor: livro.author_name ? livro.author_name[0] : 'Autor Desconhecido',
      capa: livro.cover_i ? `https://covers.openlibrary.org/b/id/${livro.cover_i}-M.jpg` : null,
      ano: livro.first_publish_year
    }));

    return livrosFormatados;
  } catch (error) {
    console.error("Erro ao buscar livros na Open Library:", error);
    return []; 
  }
};

// busca detalhes adicionais de uma obra usando o identificador retornado pela pesquisa
export const buscarDetalhesLivro = async (idApi) => {
  if (!idApi) return null;
  try {
    const resposta = await axios.get(`https://openlibrary.org${idApi}.json`);
    return resposta.data;
  } catch (error) {
    console.error('Erro ao buscar detalhes do livro:', error);
    return null;
  }
};