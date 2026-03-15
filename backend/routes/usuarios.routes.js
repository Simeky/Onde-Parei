const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { lerDados, salvarDados } = require('../utils/filehandler.js');

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const usuarios = lerDados('usuarios');
  const usuario = usuarios.find(u => u.id === id);
  
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  
  res.status(200).json({ id: usuario.id, email: usuario.email, provider: usuario.provider });
});

router.post('/cadastrar', async (req, res) => {
  const { email, senha } = req.body;
  const usuarios = lerDados('usuarios');
  
  if (usuarios.find(u => u.email === email)) {
    return res.status(400).json({ erro: 'E-mail já cadastrado.' });
  }

  const senhaCriptografada = await bcrypt.hash(senha, 10);

  const novoUsuario = {
    id: Date.now().toString(),
    email,
    senha: senhaCriptografada,
    provider: 'local' 
  };

  usuarios.push(novoUsuario);
  salvarDados('usuarios', usuarios);
  
  res.status(201).json({ mensagem: 'Usuário criado com sucesso!', usuario: { id: novoUsuario.id, email } });
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const usuarios = lerDados('usuarios');

  const usuario = usuarios.find(u => u.email === email);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) return res.status(401).json({ erro: 'Senha incorreta.' });

  res.status(200).json({ mensagem: 'Login realizado com sucesso!', usuario: { id: usuario.id, email: usuario.email } });
});

router.post('/login_google', async (req, res) => {
  const { email } = req.body;
  const usuarios = lerDados('usuarios');
  const usuarioExistente = usuarios.find(u => u.email === email);

  if (usuarioExistente) {
    return res.status(200).json({ mensagem: 'Login com Google realizado com sucesso!', usuario: { id: usuarioExistente.id, email: usuarioExistente.email } });
  } else {
    const senhaCriptografada = await bcrypt.hash(Date.now().toString(), 10);
    const novoUsuario = {
      id: Date.now().toString(),
      email: email,
      senha: senhaCriptografada,
      provider: 'google'
    };

    usuarios.push(novoUsuario);
    salvarDados('usuarios', usuarios);
    return res.status(201).json({ mensagem: 'Conta criada e vinculada ao Google com sucesso!', usuario: { id: novoUsuario.id, email: novoUsuario.email } });
  }
});

router.patch('/atualizar_senha/:id', async (req, res) => {
  const { id } = req.params;
  const { novaSenha } = req.body;
  const usuarios = lerDados('usuarios');
  const index = usuarios.findIndex(u => u.id === id);

  if (index === -1) return res.status(404).json({ erro: 'Usuário não encontrado.' });

  usuarios[index].senha = await bcrypt.hash(novaSenha, 10);
  salvarDados('usuarios', usuarios);
  res.status(200).json({ mensagem: 'Senha atualizada com sucesso!' });
});

router.delete('/deletar_conta/:id', async (req, res) => {
  const { id } = req.params;
  const { senha, provider } = req.body; 
  
  const usuarios = lerDados('usuarios');
  const index = usuarios.findIndex(u => u.id === id);

  if (index === -1) return res.status(404).json({ erro: 'Usuário não encontrado.' });

  if (provider === 'local') {
    if (!senha) return res.status(400).json({ erro: 'A senha é obrigatória.' });
    const senhaValida = await bcrypt.compare(senha, usuarios[index].senha);
    if (!senhaValida) return res.status(401).json({ erro: 'Senha incorreta.' });
  }

  usuarios.splice(index, 1);
  salvarDados('usuarios', usuarios);

  const livros = lerDados('livros');
  const livrosRestantes = livros.filter(l => l.usuario_id !== id);
  salvarDados('livros', livrosRestantes);

  res.status(200).json({ mensagem: 'Conta e dados removidos com sucesso.' });
});

module.exports = router;