import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/usuarios'
});

export const cadastrarUsuario = async (dadosUsuario) => {
  const resposta = await api.post('/cadastrar', dadosUsuario);
  return resposta.data;
};

export const fazerLogin = async (credenciais) => {
  const resposta = await api.post('/login', credenciais);
  return resposta.data;
};

export const atualizarSenha = async (id, novaSenha) => {
  const resposta = await api.patch(`/atualizar_senha/${id}`, { novaSenha });
  return resposta.data;
};

export const deletarConta = async (id) => {
  const resposta = await api.delete(`/deletar_conta/${id}`);
  return resposta.data;
};