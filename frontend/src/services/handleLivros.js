import axios from 'axios';

const api = axios.create({
  baseURL: 'http://15.228.202.17.nip.io:5000/livros'
});

export const listarMeusLivros = async (usuarioId) => {
  const resposta = await api.get(`/listar_livros/${usuarioId}`);
  return resposta.data;
};

export const adicionarLivro = async (dadosLivro) => {
  const resposta = await api.post('/cadastrar_livro', dadosLivro);
  return resposta.data;
};

export const atualizarLivro = async (idLivro, dadosAtualizados) => {
  const resposta = await api.patch(`/atualizar_livro/${idLivro}`, dadosAtualizados);
  return resposta.data;
};

export const removerLivro = async (idLivro) => {
  const resposta = await api.delete(`/deletar_livro/${idLivro}`);
  return resposta.data;
};