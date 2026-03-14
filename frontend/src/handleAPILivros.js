import axios from 'axios';

const google_api_key = 'AIzaSyCB_j7-o4_jMjq7uvdnFYHvZBMDyrlVFV0';
const apiGoogleBooks = axios.create({
  baseURL: 'https://www.googleapis.com/books/v1'
});


export const buscarLivrosApiExterna = async (termo, startIndex = 0) => {
  try {
    const resposta = await apiGoogleBooks.get(`/volumes`, {
      params: {
        q: termo,
        maxResults: 12, // Traz 12 resultados por vez
        startIndex: startIndex, // Começa do resultado especificado
        langRestrict: 'pt', // Prioriza livros em português
        key: google_api_key
      }
    });

    const itens = resposta.data.items || [];

    const livrosFormatados = itens.map(livro => {
      const info = livro.volumeInfo;
      
      // melhorado como é tratado os dados da capa do livro.
      let CapaUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null;
      if (CapaUrl) {
        CapaUrl = CapaUrl.replace('http:', 'https:');
        CapaUrl = CapaUrl.replace('&zoom=1', '&zoom=0');
        CapaUrl = CapaUrl.replace('&edge=curl', '');     
      }

      return {
        id_api: livro.id,
        titulo: info.title || 'Sem Título',
        autor: info.authors ? info.authors[0] : 'Desconhecido',
        capa: CapaUrl,
        paginas: info.pageCount || 0,
        categoria: info.categories ? info.categories[0] : 'Geral',
        ano: info.publishedDate ? info.publishedDate : 'N/A'
      };
    });

    return livrosFormatados;
  } catch (erro) {
    console.error("Erro ao buscar livros na Google Books API:", erro);
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