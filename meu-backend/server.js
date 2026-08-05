const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 🔌 Cole AQUI dentro das aspas a "Connection String" que você copiou do Neon
const DATABASE_URL = 'postgresql://neondb_owner:npg_IE97gnLsxRXY@ep-lively-cloud-axd4ek07.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require';

// Conexão com o PostgreSQL na nuvem
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 📥 Rota GET: Busca os produtos direto do PostgreSQL na Nuvem
app.get('/api/produtos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM produtos ORDER BY id ASC');
    res.json(resultado.rows);
  } catch (erro) {
    console.error('Erro ao buscar produtos:', erro);
    res.status(500).json({ erro: 'Erro interno no banco de dados' });
  }
});

// 📤 Rota POST: Salva um novo produto no PostgreSQL
app.post('/api/produtos', async (req, res) => {
  const { nome, preco } = req.body;

  if (!nome || !preco) {
    return res.status(400).json({ erro: 'Nome e preço são obrigatórios' });
  }

  try {
    const novoProduto = await pool.query(
      'INSERT INTO produtos (nome, preco) VALUES ($1, $2) RETURNING *',
      [nome, parseFloat(preco)]
    );
    res.status(201).json(novoProduto.rows[0]);
  } catch (erro) {
    console.error('Erro ao salvar produto:', erro);
    res.status(500).json({ erro: 'Erro ao salvar produto no banco' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT} e conectado ao PostgreSQL (Neon)!`);
});