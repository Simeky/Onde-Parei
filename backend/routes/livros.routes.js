const express = require('express');
const router = express.Router();
const pool = require('../config/dbAWS.js');

router.post('/cadastrar_livro', async (req, res) => {
  try {
    const { usuario_id, id_api, titulo, autor, capa, ano, status, paginaAtual, anotacao, paginas, categoria } = req.body;
    
    if (!usuario_id) return res.status(400).json({ erro: 'O ID do usuário é obrigatório.' });

    const connection = await pool.getConnection();

    // Verificar se o livro já existe na biblioteca global
    const [livrosExistentes] = await connection.query('SELECT id FROM TLivros WHERE google_books_id = ?', [id_api]);
    
    let livroId;
    if (livrosExistentes.length > 0) {
      livroId = livrosExistentes[0].id;
    } else {
      // Inserir novo livro na TLivros
      const [resultadoLivro] = await connection.query(
        'INSERT INTO TLivros (google_books_id, titulo, autor, capa_url, paginas_totais, ano, categoria) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id_api, titulo, autor, capa, paginas || 0, ano || null, categoria || null]
      );
      livroId = resultadoLivro.insertId;
    }

    // Inserir registro de progresso
    await connection.query(
      'INSERT INTO TProgresso_leitura (usuario_id, livro_id, pagina_atual, anotação, status) VALUES (?, ?, ?, ?, ?)',
      [usuario_id, livroId, paginaAtual || 0, anotacao || '', status || 'para ler']
    );

    connection.release();

    res.status(201).json({ 
      mensagem: 'Livro adicionado!', 
      livro: {
        livroId,
        usuario_id,
        id_api,
        titulo,
        autor,
        capa,
        paginas: paginas || 0,
        ano: ano || null,
        categoria: categoria || null,
        status: status || 'para ler',
        paginaAtual: paginaAtual || 0,
        anotacao: anotacao || ''
      }
    });
  } catch (error) {
    console.error('Erro ao cadastrar livro:', error);
    res.status(500).json({ erro: 'Erro ao cadastrar livro.' });
  }
});

router.get('/listar_livros/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const connection = await pool.getConnection();
    
    const [livros] = await connection.query(`
      SELECT 
        tp.id as progressoId,
        tp.usuario_id,
        tl.id as livroId,
        tl.google_books_id as id_api,
        tl.titulo,
        tl.autor,
        tl.capa_url as capa,
        tl.paginas_totais as paginas,
        tl.ano,
        tl.categoria,
        tp.pagina_atual as paginaAtual,
        tp.anotação as anotacao,
        tp.status
      FROM TProgresso_leitura tp
      INNER JOIN TLivros tl ON tp.livro_id = tl.id
      WHERE tp.usuario_id = ?
    `, [usuario_id]);
    
    connection.release();
    res.status(200).json(livros);
  } catch (error) {
    console.error('Erro ao listar livros:', error);
    res.status(500).json({ erro: 'Erro ao listar livros.' });
  }
});

router.patch('/atualizar_livro/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paginaAtual, anotacao } = req.body;
    
    const connection = await pool.getConnection();

    const [progressos] = await connection.query('SELECT * FROM TProgresso_leitura WHERE id = ?', [id]);

    if (progressos.length === 0) {
      connection.release();
      return res.status(404).json({ erro: 'Livro não encontrado.' });
    }

    const progresso = progressos[0];

    await connection.query(
      'UPDATE TProgresso_leitura SET status = ?, pagina_atual = ?, anotação = ? WHERE id = ?',
      [
        status !== undefined ? status : progresso.status,
        paginaAtual !== undefined ? paginaAtual : progresso.pagina_atual,
        anotacao !== undefined ? anotacao : progresso.anotação,
        id
      ]
    );

    const [livros] = await connection.query(`
      SELECT 
        tp.id as progressoId,
        tp.usuario_id,
        tl.id as livroId,
        tl.google_books_id as id_api,
        tl.titulo,
        tl.autor,
        tl.capa_url as capa,
        tl.paginas_totais as paginas,
        tl.ano,
        tl.categoria,
        tp.pagina_atual as paginaAtual,
        tp.anotação as anotacao,
        tp.status
      FROM TProgresso_leitura tp
      INNER JOIN TLivros tl ON tp.livro_id = tl.id
      WHERE tp.id = ?
    `, [id]);

    connection.release();

    res.status(200).json({ mensagem: 'Livro atualizado!', livro: livros[0] });
  } catch (error) {
    console.error('Erro ao atualizar livro:', error);
    res.status(500).json({ erro: 'Erro ao atualizar livro.' });
  }
});

router.delete('/deletar_livro/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [progressos] = await connection.query('SELECT * FROM TProgresso_leitura WHERE id = ?', [id]);

    if (progressos.length === 0) {
      connection.release();
      return res.status(404).json({ erro: 'Livro não encontrado.' });
    }

    await connection.query('DELETE FROM TProgresso_leitura WHERE id = ?', [id]);
    connection.release();

    res.status(200).json({ mensagem: 'Livro removido da biblioteca.' });
  } catch (error) {
    console.error('Erro ao deletar livro:', error);
    res.status(500).json({ erro: 'Erro ao deletar livro.' });
  }
});

module.exports = router;