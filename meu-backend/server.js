const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 🔌 Sua URL do Neon (certifique-se de que é a sua URL real aqui)
const DATABASE_URL = 'postgresql://neondb_owner:npg_IE97gnLsxRXY@ep-lively-cloud-axd4ek07.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 📥 Rota GET: Retorna o Cardápio do Restaurante
app.get('/api/produtos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM produtos ORDER BY id ASC');
    res.json(resultado.rows);
  } catch (erro) {
    console.error('Erro ao buscar cardápio:', erro);
    res.status(500).json({ erro: 'Erro no servidor' });
  }
});

// 📤 Rota POST: Cadastra novos pratos
app.post('/api/produtos', async (req, res) => {
  const { nome, descricao, preco, categoria, imagem_url } = req.body;

  if (!nome || !preco || !categoria) {
    return res.status(400).json({ erro: 'Campos obrigatórios faltando!' });
  }

  try {
    const novoPrato = await pool.query(
      'INSERT INTO produtos (nome, descricao, preco, categoria, imagem_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nome, descricao || '', parseFloat(preco), categoria, imagem_url || '']
    );
    res.status(201).json(novoPrato.rows[0]);
  } catch (erro) {
    console.error('Erro ao cadastrar prato:', erro);
    res.status(500).json({ erro: 'Erro no servidor ao salvar prato' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API do Restaurante rodando na porta ${PORT}`);
});