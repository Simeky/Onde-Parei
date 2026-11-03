const express = require('express');
const bcrypt = require('bcryptjs');
const { FieldValue } = require('firebase-admin/firestore');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();
const db = require('../config/firebase.js');

// Coleções (equivalentes às tabelas TUsuarios e TProgresso_leitura)
const usuariosCol = db.collection('usuarios');
const progressoCol = db.collection('progresso_leitura');

const googleClient = new OAuth2Client();

async function buscarPorEmail(email) {
  const resultado = await usuariosCol.where('email', '==', email).limit(1).get();
  return resultado.empty ? null : resultado.docs[0];
}

router.get('/:id', async (req, res) => {
  try {
    const usuarioDoc = await usuariosCol.doc(req.params.id).get();
    if (!usuarioDoc.exists) return res.status(404).json({ erro: 'Usuário não encontrado.' });

    const { email, provider } = usuarioDoc.data();
    res.status(200).json({ id: usuarioDoc.id, email, provider });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ erro: 'Erro ao buscar usuário.' });
  }
});

router.post('/cadastrar', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });

    if (await buscarPorEmail(email)) {
      return res.status(400).json({ erro: 'E-mail já cadastrado.' });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);
    const novoUsuario = await usuariosCol.add({
      email,
      senha: senhaCriptografada,
      provider: 'local',
      criadoEm: FieldValue.serverTimestamp()
    });

    res.status(201).json({ mensagem: 'Usuário criado com sucesso!', usuario: { id: novoUsuario.id, email } });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuarioDoc = email ? await buscarPorEmail(email) : null;
    if (!usuarioDoc) return res.status(404).json({ erro: 'Usuário não encontrado.' });

    const senhaValida = await bcrypt.compare(senha || '', usuarioDoc.data().senha);
    if (!senhaValida) return res.status(401).json({ erro: 'Senha incorreta.' });

    res.status(200).json({ mensagem: 'Login realizado com sucesso!', usuario: { id: usuarioDoc.id, email } });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ erro: 'Erro ao fazer login.' });
  }
});

router.post('/login_google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ erro: 'Credencial do Google é obrigatória.' });
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID não configurado no backend/.env.local');
      return res.status(500).json({ erro: 'Login com Google não configurado no servidor.' });
    }

    // Confere a assinatura do token com o Google antes de confiar no e-mail
    let email;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      const dados = ticket.getPayload();
      if (!dados.email_verified) throw new Error('E-mail do Google não verificado.');
      email = dados.email;
    } catch (erroToken) {
      console.error('Token do Google inválido:', erroToken.message);
      return res.status(401).json({ erro: 'Credencial do Google inválida.' });
    }

    const usuarioDoc = await buscarPorEmail(email);
    if (usuarioDoc) {
      return res.status(200).json({ mensagem: 'Login com Google realizado com sucesso!', usuario: { id: usuarioDoc.id, email } });
    }

    const senhaCriptografada = await bcrypt.hash(Date.now().toString(), 10);
    const novoUsuario = await usuariosCol.add({
      email,
      senha: senhaCriptografada,
      provider: 'google',
      criadoEm: FieldValue.serverTimestamp()
    });
    res.status(201).json({ mensagem: 'Conta criada e vinculada ao Google com sucesso!', usuario: { id: novoUsuario.id, email } });
  } catch (error) {
    console.error('Erro ao fazer login com Google:', error);
    res.status(500).json({ erro: 'Erro ao fazer login com Google.' });
  }
});

router.patch('/atualizar_senha/:id', async (req, res) => {
  try {
    const { novaSenha } = req.body;
    const usuarioRef = usuariosCol.doc(req.params.id);

    if (!(await usuarioRef.get()).exists) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    if (!novaSenha) return res.status(400).json({ erro: 'A nova senha é obrigatória.' });

    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);
    await usuarioRef.update({ senha: senhaCriptografada });

    res.status(200).json({ mensagem: 'Senha atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ erro: 'Erro ao atualizar senha.' });
  }
});

router.delete('/deletar_conta/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { senha } = req.body || {};
    const usuarioRef = usuariosCol.doc(id);
    const usuarioDoc = await usuarioRef.get();

    if (!usuarioDoc.exists) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const usuario = usuarioDoc.data();
    if (usuario.provider === 'local') {
      if (!senha) {
        return res.status(400).json({ erro: 'A senha é obrigatória.' });
      }
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ erro: 'Senha incorreta.' });
      }
    }

    // Substitui o ON DELETE CASCADE: apaga os progressos e depois o usuário
    const progressos = await progressoCol.where('usuarioId', '==', id).get();
    const docs = [...progressos.docs.map(d => d.ref), usuarioRef];
    for (let i = 0; i < docs.length; i += 500) {
      const lote = db.batch();
      docs.slice(i, i + 500).forEach(ref => lote.delete(ref));
      await lote.commit();
    }

    res.status(200).json({ mensagem: 'Conta e dados removidos com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({ erro: 'Erro ao deletar conta.' });
  }
});

module.exports = router;
