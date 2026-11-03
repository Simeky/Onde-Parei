const express = require('express');
const { FieldValue } = require('firebase-admin/firestore');
const router = express.Router();
const db = require('../config/firebase.js');

// Coleções (equivalentes às tabelas TLivros e TProgresso_leitura)
const livrosCol = db.collection('livros');
const progressoCol = db.collection('progresso_leitura');

// Mesma regra do antigo trigger trg_atualiza_status_leitura do MySQL.
function calcularStatus(paginaAtual, paginasTotais) {
  if (paginaAtual <= 0) {
    return { status: 'para ler', paginaAtual: 0 };
  }
  if (paginasTotais > 0 && paginaAtual >= paginasTotais) {
    return { status: 'lido', paginaAtual: paginasTotais };
  }
  return { status: 'lendo', paginaAtual };
}

// Ano vem como "2020", 2020 ou "N/A"; guarda número ou null.
function normalizarAno(ano) {
  const numero = parseInt(ano, 10);
  return Number.isNaN(numero) ? null : numero;
}

// Junta progresso + livro no mesmo formato que o SELECT com JOIN devolvia.
function montarLivro(progressoDoc, livroDoc) {
  const progresso = progressoDoc.data();
  const livro = livroDoc && livroDoc.exists ? livroDoc.data() : {};
  return {
    progressoId: progressoDoc.id,
    usuario_id: progresso.usuarioId,
    livroId: progresso.livroId,
    id_api: progresso.livroId,
    titulo: livro.titulo,
    autor: livro.autor,
    capa: livro.capaUrl,
    paginas: livro.paginasTotais,
    ano: livro.ano,
    categoria: livro.categoria,
    paginaAtual: progresso.paginaAtual,
    anotacao: progresso.anotacao,
    status: progresso.status
  };
}

router.post('/cadastrar_livro', async (req, res) => {
  try {
    const { usuario_id, id_api, titulo, autor, capa, ano, status, paginaAtual, anotacao, paginas, categoria } = req.body;

    if (!usuario_id) return res.status(400).json({ erro: 'O ID do usuário é obrigatório.' });
    if (!id_api) return res.status(400).json({ erro: 'O ID do livro é obrigatório.' });

    const livroId = String(id_api);
    const progressoId = `${usuario_id}_${livroId}`;
    const progressoRef = progressoCol.doc(progressoId);

    if ((await progressoRef.get()).exists) {
      return res.status(409).json({ erro: 'Livro já está na sua biblioteca.' });
    }

    // Cadastra o livro no catálogo global só se ainda não existir
    const livroRef = livrosCol.doc(livroId);
    if (!(await livroRef.get()).exists) {
      await livroRef.set({
        titulo,
        autor: autor || null,
        capaUrl: capa || null,
        paginasTotais: parseInt(paginas, 10) || 0,
        ano: normalizarAno(ano),
        categoria: categoria || null
      });
    }

    await progressoRef.set({
      usuarioId: String(usuario_id),
      livroId,
      paginaAtual: paginaAtual || 0,
      anotacao: anotacao || '',
      status: status || 'para ler',
      ultimaAlteracao: FieldValue.serverTimestamp()
    });

    res.status(201).json({
      mensagem: 'Livro adicionado!',
      livro: {
        progressoId,
        livroId,
        usuario_id,
        id_api,
        titulo,
        autor,
        capa,
        paginas: paginas || 0,
        ano: normalizarAno(ano),
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

    const progressos = await progressoCol.where('usuarioId', '==', String(usuario_id)).get();
    if (progressos.empty) return res.status(200).json([]);

    const livrosDocs = await db.getAll(...progressos.docs.map(p => livrosCol.doc(p.data().livroId)));
    const livros = progressos.docs.map((p, i) => montarLivro(p, livrosDocs[i]));

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

    const progressoRef = progressoCol.doc(id);
    const progressoDoc = await progressoRef.get();

    if (!progressoDoc.exists) {
      return res.status(404).json({ erro: 'Livro não encontrado.' });
    }

    const progresso = progressoDoc.data();
    const livroDoc = await livrosCol.doc(progresso.livroId).get();

    let novoStatus = status !== undefined ? status : progresso.status;
    let novaPagina = paginaAtual !== undefined ? Number(paginaAtual) : progresso.paginaAtual;

    // Como o trigger: só recalcula o status quando a página muda
    if (novaPagina !== progresso.paginaAtual) {
      const paginasTotais = livroDoc.exists ? livroDoc.data().paginasTotais : 0;
      ({ status: novoStatus, paginaAtual: novaPagina } = calcularStatus(novaPagina, paginasTotais));
    }

    await progressoRef.update({
      status: novoStatus,
      paginaAtual: novaPagina,
      anotacao: anotacao !== undefined ? anotacao : progresso.anotacao,
      ultimaAlteracao: FieldValue.serverTimestamp()
    });

    const livro = montarLivro(await progressoRef.get(), livroDoc);
    res.status(200).json({ mensagem: 'Livro atualizado!', livro });
  } catch (error) {
    console.error('Erro ao atualizar livro:', error);
    res.status(500).json({ erro: 'Erro ao atualizar livro.' });
  }
});

router.delete('/deletar_livro/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const progressoRef = progressoCol.doc(id);

    if (!(await progressoRef.get()).exists) {
      return res.status(404).json({ erro: 'Livro não encontrado.' });
    }

    await progressoRef.delete();
    res.status(200).json({ mensagem: 'Livro removido da biblioteca.' });
  } catch (error) {
    console.error('Erro ao deletar livro:', error);
    res.status(500).json({ erro: 'Erro ao deletar livro.' });
  }
});

module.exports = router;
