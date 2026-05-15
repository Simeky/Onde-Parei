import axios from 'axios';

const google_api_key = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
const apiGoogleBooks = axios.create({
  baseURL: 'https://www.googleapis.com/books/v1'
});

// Cache simples em memória para evitar chamadas desnecessárias
const cacheResultados = new Map();
const TEMPO_CACHE = 1000 * 60 * 30; // 30 minutos

const ESCOPOS_VALIDOS = new Set(['geral', 'autor', 'titulo']);

/**
 * @param {string} termoBruto
 * @returns {string}
 */
const sanitizarTermoBusca = (termoBruto) => {
  if (!termoBruto) return '';
  return termoBruto
    .trim()
    .replace(/"/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Monta o parâmetro `q` da Google Books (frase entre aspas; opcionalmente inauthor/intitle).
 * @param {string} termoSanitizado
 * @param {'geral'|'autor'|'titulo'} escopo
 * @returns {string}
 */
const montarQueryBusca = (termoSanitizado, escopo) => {
  const comAspas = `"${termoSanitizado}"`;
  if (escopo === 'autor') return `inauthor:${comAspas}`;
  if (escopo === 'titulo') return `intitle:${comAspas}`;
  return comAspas;
};

/**
 * Normaliza e valida a URL da capa do livro
 * @param {Object} imageLinks - Objeto contendo as URLs das imagens
 * @returns {string|null} - URL normalizada ou null
 */
const normalizarCapaUrl = (imageLinks) => {
  if (!imageLinks) return null;
  
  let capaUrl = imageLinks.thumbnail || imageLinks.smallThumbnail || null;
  if (!capaUrl) return null;

  // Normalizar para HTTPS
  capaUrl = capaUrl.replace('http:', 'https:');
  // Melhorar qualidade da imagem
  capaUrl = capaUrl.replace('&zoom=1', '&zoom=0');
  capaUrl = capaUrl.replace('&edge=curl', '');
  
  return capaUrl;
};

/**
 * Valida se um livro possui informações essenciais de qualidade
 * (título, autor, capa, ISBN e número de páginas para uso no app).
 * @param {Object} livro - Objeto do livro da API
 * @returns {boolean} - True se o livro possui dados de qualidade
 */
const ehLivroDeQualidade = (livro) => {
  const info = livro.volumeInfo;
  
  // Verificar dados essenciais
  const temTitulo = info.title && info.title.trim().length > 0;
  const temAutor = info.authors && info.authors.length > 0;
  const temCapa = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
  const ids = info.industryIdentifiers || [];
  const temIsbn = ids.some(
    (id) => id.type === 'ISBN_10' || id.type === 'ISBN_13'
  );
  const temPaginas = Number(info.pageCount) > 0;
  
  return temTitulo && temAutor && temCapa && temIsbn && temPaginas;
};

/**
 * Formata dados de um livro da API Google Books para o formato da aplicação
 * @param {Object} livro - Objeto bruto do livro
 * @returns {Object} - Livro formatado
 */
const formatarLivro = (livro) => {
  const info = livro.volumeInfo;
  
  // Extrair autores - concatenar se houver múltiplos
  const autores = info.authors || ['Desconhecido'];
  const autorFormatado = autores.length > 1 
    ? autores.slice(0, 2).join(', ') + (autores.length > 2 ? ' e outros' : '')
    : autores[0];

  // Extrair categoria principal
  const categoria = (info.categories && info.categories.length > 0)
    ? info.categories[0]
    : 'Geral';

  // Extrair ano de publicação
  const ano = info.publishedDate ? info.publishedDate.substring(0, 4) : 'N/A';

  return {
    id_api: livro.id,
    titulo: info.title || 'Sem Título',
    autor: autorFormatado,
    capa: normalizarCapaUrl(info.imageLinks),
    paginas: info.pageCount || 0,
    categoria: categoria,
    ano: ano
  };
};

/**
 * Busca livros na API do Google Books com parâmetros otimizados
 * @param {string} termo - Termo de busca
 * @param {number} startIndex - Índice inicial para paginação
 * @param {'geral'|'autor'|'titulo'} [escopo='geral'] - Escopo da query (frase geral, inauthor ou intitle)
 * @returns {Promise<Array>} - Array de livros formatados
 */
export const buscarLivrosApiExterna = async (termo, startIndex = 0, escopo = 'geral') => {
  const escopoNormalizado = ESCOPOS_VALIDOS.has(escopo) ? escopo : 'geral';
  const termoSanitizado = sanitizarTermoBusca(termo);

  try {
    if (!termoSanitizado) {
      console.warn("Termo de busca vazio");
      return [];
    }

    const query = montarQueryBusca(termoSanitizado, escopoNormalizado);
    const chaveCache = `${escopoNormalizado}_${termoSanitizado.toLowerCase()}_${startIndex}`;

    if (cacheResultados.has(chaveCache)) {
      const { data, timestamp } = cacheResultados.get(chaveCache);
      if (Date.now() - timestamp < TEMPO_CACHE) {
        console.log("Retornando resultados do cache");
        return data;
      }
    }

    const resposta = await apiGoogleBooks.get(`/volumes`, {
      params: {
        q: query,
        maxResults: 12,
        startIndex: startIndex,
        printType: 'books', // Apenas livros (não revistas)
        orderBy: 'relevance', // Ordenar por relevância
        key: google_api_key
      }
    });

    const itens = resposta.data.items || [];

    // Filtrar livros de qualidade e formatar
    const livrosFormatados = itens
      .filter(livro => ehLivroDeQualidade(livro))
      .map(livro => formatarLivro(livro));

    // Armazenar no cache
    cacheResultados.set(chaveCache, {
      data: livrosFormatados,
      timestamp: Date.now()
    });

    // Limpar cache antigo se crescer muito
    if (cacheResultados.size > 50) {
      const primeiraChave = cacheResultados.keys().next().value;
      cacheResultados.delete(primeiraChave);
    }

    return livrosFormatados;
  } catch (erro) {
    console.error("Erro ao buscar livros na Google Books API:", erro);
    
    const prefixoChave = `${escopoNormalizado}_${termoSanitizado.toLowerCase()}_`;
    for (const [chave, { data }] of cacheResultados.entries()) {
      if (chave.startsWith(prefixoChave)) {
        console.warn("Retornando dados em cache expirado devido a erro na API");
        return data;
      }
    }
    
    return [];
  }
};
