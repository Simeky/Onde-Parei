const express = require('express');
const router = express.Router();
const { lerDados, salvarDados } = require('../utils/filehandler.js');

router.post('/cadastrar_livro', (req, res) => {
  const { usuario_id, id_api, titulo, autor, capa, ano, status, paginaAtual, anotacao, paginas, categoria } = req.body;
  if (!usuario_id) return res.status(400).json({ erro: 'O ID do usuário é obrigatório.' });

  const livros = lerDados('livros');
  const novoLivro = {
    id: Date.now().toString(),
    usuario_id, 
    id_api, titulo, autor, capa,
    paginas: paginas || 0,
    ano: ano || 'N/A',
    categoria: categoria || 'N/A',
    status: status || 'Para ler',
    paginaAtual: paginaAtual || 0,
    anotacao: anotacao || ''
  };

  livros.push(novoLivro);
  salvarDados('livros', livros);
  res.status(201).json({ mensagem: 'Livro adicionado!', livro: novoLivro });
});

router.get('/listar_livros/:usuario_id', (req, res) => {
  const { usuario_id } = req.params;
  const livros = lerDados('livros');
  
  const livrosDoUsuario = livros.filter(l => l.usuario_id === usuario_id);
  res.status(200).json(livrosDoUsuario);
});

router.patch('/atualizar_livro/:id', (req, res) => {
  const { id } = req.params;
  const { status, paginaAtual, anotacao } = req.body;
  
  const livros = lerDados('livros');
  const index = livros.findIndex(l => l.id === id);

  if (index === -1) return res.status(404).json({ erro: 'Livro não encontrado.' });

  livros[index] = {
    ...livros[index],
    status: status !== undefined ? status : livros[index].status,
    paginaAtual: paginaAtual !== undefined ? paginaAtual : livros[index].paginaAtual,
    anotacao: anotacao !== undefined ? anotacao : livros[index].anotacao
  };

  salvarDados('livros', livros);
  res.status(200).json({ mensagem: 'Livro atualizado!', livro: livros[index] });
});

router.delete('/deletar_livro/:id', (req, res) => {
  const { id } = req.params;
  const livros = lerDados('livros');
  const livrosFiltrados = livros.filter(l => l.id !== id);

  if (livros.length === livrosFiltrados.length) return res.status(404).json({ erro: 'Livro não encontrado.' });

  salvarDados('livros', livrosFiltrados);
  res.status(200).json({ mensagem: 'Livro removido da biblioteca.' });
});

module.exports = router;