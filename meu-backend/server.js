const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuração do PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Se for banco em nuvem (Render, Supabase, Neon), descomente a linha abaixo:
  // ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('⚡ Conectado ao banco de dados PostgreSQL!');
});

// Middlewares
app.use(cors());
app.use(express.json());

// --- ROTAS DA API ---

// 1. GET - Listar todos os produtos
app.get('/api/produtos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM produtos ORDER BY id DESC');
    res.status(200).json(resultado.rows);
  } catch (erro) {
    console.error('Erro ao buscar produtos:', erro);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// 2. POST - Cadastrar novo produto
app.post('/api/produtos', async (req, res) => {
  const { nome, descricao, preco, categoria, imagem_url } = req.body;

  if (!nome || !preco || !categoria) {
    return res.status(400).json({ error: 'Nome, preço e categoria são obrigatórios.' });
  }

  try {
    const query = `
      INSERT INTO produtos (nome, descricao, preco, categoria, imagem_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const valores = [nome, descricao || '', preco, categoria, imagem_url || ''];
    const resultado = await pool.query(query, valores);

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error('Erro ao cadastrar produto:', erro);
    res.status(500).json({ error: 'Erro ao cadastrar produto' });
  }
});

// 3. DELETE - Deletar produto pelo ID
app.delete('/api/produtos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query('DELETE FROM produtos WHERE id = $1 RETURNING *;', [id]);

    if (resultado.rowCount === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.status(200).json({ message: 'Produto deletado com sucesso!', produto: resultado.rows[0] });
  } catch (erro) {
    console.error('Erro ao deletar produto:', erro);
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

// Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});