const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const pool = require('../config/dbAWS.js');

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
      const [usuarios] = await connection.query('SELECT id, email, provider FROM TUsuarios WHERE id = ?', [id]);
      if (usuarios.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
      res.status(200).json({ id: usuarios[0].id, email: usuarios[0].email, provider: usuarios[0].provider });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ erro: 'Erro ao buscar usuário.' });
  }
});

router.post('/cadastrar', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const connection = await pool.getConnection();
    try {
      const [usuariosExistentes] = await connection.query('SELECT id FROM TUsuarios WHERE email = ?', [email]);
      if (usuariosExistentes.length > 0) {
        return res.status(400).json({ erro: 'E-mail já cadastrado.' });
      }
      const senhaCriptografada = await bcrypt.hash(senha, 10);
      const [resultado] = await connection.query('INSERT INTO TUsuarios (email, senha, provider) VALUES (?, ?, ?)', [email, senhaCriptografada, 'local']);
      res.status(201).json({ mensagem: 'Usuário criado com sucesso!', usuario: { id: resultado.insertId, email } });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const connection = await pool.getConnection();
    try {
      const [usuarios] = await connection.query('SELECT id, email, senha FROM TUsuarios WHERE email = ?', [email]);
      if (usuarios.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });

      const senhaValida = await bcrypt.compare(senha, usuarios[0].senha);
      if (!senhaValida) return res.status(401).json({ erro: 'Senha incorreta.' });
      res.status(200).json({ mensagem: 'Login realizado com sucesso!', usuario: { id: usuarios[0].id, email: usuarios[0].email } });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ erro: 'Erro ao fazer login.' });
  }
});

router.post('/login_google', async (req, res) => {
  try {
    const { email } = req.body;
    const connection = await pool.getConnection();
    try {
      const [usuariosExistentes] = await connection.query('SELECT id, email FROM TUsuarios WHERE email = ?', [email]);
      if (usuariosExistentes.length > 0) {
        return res.status(200).json({ mensagem: 'Login com Google realizado com sucesso!', usuario: { id: usuariosExistentes[0].id, email: usuariosExistentes[0].email } });
      } else {
        const senhaCriptografada = await bcrypt.hash(Date.now().toString(), 10);
        const [resultado] = await connection.query('INSERT INTO TUsuarios (email, senha, provider) VALUES (?, ?, ?)', [email, senhaCriptografada, 'google']);
        return res.status(201).json({ mensagem: 'Conta criada e vinculada ao Google com sucesso!', usuario: { id: resultado.insertId, email } });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erro ao fazer login com Google:', error);
    res.status(500).json({ erro: 'Erro ao fazer login com Google.' });
  }
});

router.patch('/atualizar_senha/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { novaSenha } = req.body;
    const connection = await pool.getConnection();
    try {
      const [usuarios] = await connection.query('SELECT id FROM TUsuarios WHERE id = ?', [id]);
      if (usuarios.length === 0) {
        return res.status(404).json({ erro: 'Usuário não encontrado.' });
      }
      const senhaCriptografada = await bcrypt.hash(novaSenha, 10);
      await connection.query('UPDATE TUsuarios SET senha = ? WHERE id = ?', [senhaCriptografada, id]);
    } finally {
      connection.release();
    }
    res.status(200).json({ mensagem: 'Senha atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ erro: 'Erro ao atualizar senha.' });
  }
});

router.delete('/deletar_conta/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { senha, provider } = req.body; 
    
    const connection = await pool.getConnection();
    try {
      const [usuarios] = await connection.query('SELECT provider, senha FROM TUsuarios WHERE id = ?', [id]);
      if (usuarios.length === 0) {
        return res.status(404).json({ erro: 'Usuário não encontrado.' });
      }

      if (usuarios[0].provider === 'local') {
        if (!senha) {
          return res.status(400).json({ erro: 'A senha é obrigatória.' });
        }
        const senhaValida = await bcrypt.compare(senha, usuarios[0].senha);
        if (!senhaValida) {
          return res.status(401).json({ erro: 'Senha incorreta.' });
        }
      }
      await connection.query('DELETE FROM TProgresso_leitura WHERE usuario_id = ?', [id]);
      await connection.query('DELETE FROM TUsuarios WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
    res.status(200).json({ mensagem: 'Conta e dados removidos com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({ erro: 'Erro ao deletar conta.' });
  }
});

module.exports = router;