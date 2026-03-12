import axios from 'axios';

const google_api_key = 'AIzaSyCB_j7-o4_jMjq7uvdnFYHvZBMDyrlVFV0';
const apiGoogleBooks = axios.create({
  baseURL: 'https://www.googleapis.com/books/v1'
});


export const buscarLivrosApiExterna = async (termo) => {
  try {
    const resposta = await apiGoogleBooks.get(`/volumes`, {
      params: {
        q: termo,
        maxResults: 12, // Traz 12 resultados por vez
        langRestrict: 'pt', // Prioriza livros em português
        key: google_api_key
      }
    });

    const itens = resposta.data.items || [];

    const livrosFormatados = itens.map(livro => {
      const info = livro.volumeInfo;
      
      // O Google às vezes retorna as capas em 'http'.
      let capaUrl = info.imageLinks?.thumbnail || null;
      if (capaUrl && capaUrl.startsWith('http://')) {
        capaUrl = capaUrl.replace('http://', 'https://');
      }

      return {
        id_api: livro.id,
        titulo: info.title || 'Título Desconhecido',
        autor: info.authors ? info.authors[0] : 'Autor Desconhecido',
        capa: capaUrl,
        ano: info.publishedDate ? info.publishedDate.substring(0, 4) : 'N/A' // Pega só os 4 primeiros dígitos do ano
      };
    });

    return livrosFormatados;
  } catch (erro) {
    console.error("Erro ao buscar livros na Google Books API:", erro);
    return []; 
  }
};