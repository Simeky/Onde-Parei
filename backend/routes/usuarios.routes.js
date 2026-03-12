const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { lerDados, salvarDados } = require('../utils/filehandler.js');

router.post('/cadastrar', async (req, res) => {
  const { nome, email, senha } = req.body;
  const usuarios = lerDados('usuarios');
  
  if (usuarios.find(u => u.email === email)) {
    return res.status(400).json({ erro: 'E-mail já cadastrado.' });
  }

  //O número 10 é o "salt", nível de segurança.
  const senhaCriptografada = await bcrypt.hash(senha, 10);

  const novoUsuario = {
    id: Date.now().toString(),
    nome,
    email,
    senha: senhaCriptografada,
    provider: 'local'
  };

  usuarios.push(novoUsuario);
  salvarDados('usuarios', usuarios);
  
  res.status(201).json({ 
    mensagem: 'Usuário criado com sucesso!', 
    usuario: { id: novoUsuario.id, nome, email } 
  });
});


router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const usuarios = lerDados('usuarios');

  //Procura o usuário pelo email
  const usuario = usuarios.find(u => u.email === email);
  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  //Compara a senha digitada com a senha salva
  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) {
    return res.status(401).json({ erro: 'Senha incorreta.' });
  }

  res.status(200).json({ 
    mensagem: 'Login realizado com sucesso!', 
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } 
  });
});

router.post('/login_google', async (req, res) => {
  const { email, nome } = req.body;
  const usuarios = lerDados('usuarios');

  const usuarioExistente = usuarios.find(u => u.email === email);

  if (usuarioExistente) {
    return res.status(200).json({
      mensagem: 'Login com Google realizado com sucesso!',
      usuario: { id: usuarioExistente.id, nome: usuarioExistente.nome, email: usuarioExistente.email }
    });
  } else {
    //data atual como senha temporária, já que o usuário não vai usar essa senha para login tradicional.
    const senhaCriptografada = await bcrypt.hash(Date.now().toString(), 10);

    const novoUsuario = {
      id: Date.now().toString(),
      nome: nome,
      email: email,
      senha: senhaCriptografada,
      provider: 'google'
    };

    usuarios.push(novoUsuario);
    salvarDados('usuarios', usuarios);

    return res.status(201).json({
      mensagem: 'Conta criada e vinculada ao Google com sucesso!',
      usuario: { id: novoUsuario.id, nome: novoUsuario.nome, email: novoUsuario.email }
    });
  }
});

router.patch('/atualizar_senha/:id', async (req, res) => {
  const { id } = req.params;
  const { novaSenha } = req.body;
  
  const usuarios = lerDados('usuarios');
  const index = usuarios.findIndex(u => u.id === id);

  if (index === -1) return res.status(404).json({ erro: 'Usuário não encontrado.' });

  //Encripta a nova senha antes de salvar
  usuarios[index].senha = await bcrypt.hash(novaSenha, 10);
  salvarDados('usuarios', usuarios);
  
  res.status(200).json({ mensagem: 'Senha atualizada com sucesso!' });
});

router.delete('/deletar_conta/:id', (req, res) => {
  const { id } = req.params;
  
  const usuarios = lerDados('usuarios');
  const usuariosFiltrados = usuarios.filter(u => u.id !== id);

  if (usuarios.length === usuariosFiltrados.length) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  salvarDados('usuarios', usuariosFiltrados);

  //Deleta os livros que pertencem ao usuário
  const livros = lerDados('livros');
  const livrosRestantes = livros.filter(l => l.usuario_id !== id);
  salvarDados('livros', livrosRestantes);

  res.status(200).json({ mensagem: 'Conta e dados removidos com sucesso.' });
});

module.exports = router;