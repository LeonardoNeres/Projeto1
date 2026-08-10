const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuração do PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Se for banco em nuvem (Render, Supabase, Neon), ative a linha abaixo em produção:
  // ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('⚡ Conectado ao banco de dados PostgreSQL!');
});

// Middlewares Globais
app.use(cors({
  origin: 'http://localhost:3000', // Endereço do seu Front-end Next.js
  credentials: true                // OBRIGATÓRIO: Permite transporte de cookies HttpOnly
}));

app.use(express.json());
app.use(cookieParser()); // Ativa o leitor de cookies de requisição

// 🔑 MIDDLEWARE DE AUTENTICAÇÃO
// Bloqueia qualquer chamada ao banco de dados que não possua um cookie válido
const autenticarAdmin = (req, res, next) => {
  const token = req.cookies.admin_token;

  if (!token) {
    return res.status(401).json({ error: 'Não autorizado. Faça login primeiro.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'chave_secreta_para_assinar_o_token_12345';
    const decoded = jwt.verify(token, jwtSecret);
    req.admin = decoded;
    next(); // Autorizado: Prossegue para a rota
  } catch (erro) {
    return res.status(401).json({ error: 'Sessão expirada ou inválida.' });
  }
};

// ==========================================
// 🔓 ROTAS PÚBLICAS
// ==========================================

// 1. GET - Listar todos os produtos (Visível para os clientes)
app.get('/api/produtos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM produtos ORDER BY id DESC');
    res.status(200).json(resultado.rows);
  } catch (erro) {
    console.error('Erro ao buscar produtos:', erro);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// 2. POST - Login (Gera e envia o cookie HttpOnly)
app.post('/api/login', (req, res) => {
  const { senha } = req.body;
  const senhaCorreta = process.env.ADMIN_PASSWORD || 'admin123';
  const jwtSecret = process.env.JWT_SECRET || 'chave_secreta_para_assinar_o_token_12345';

  if (senha !== senhaCorreta) {
    return res.status(401).json({ error: 'Senha incorreta!' });
  }

  // Gera o token assinado
  const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: '8h' });

  // Define o cookie seguro no navegador
  res.cookie('admin_token', token, {
    httpOnly: true,                                // Impede leitura/roubo via JavaScript (XSS)
    secure: process.env.NODE_ENV === 'production', // HTTPS apenas em produção
    sameSite: 'lax',
    });

  return res.status(200).json({ ok: true, message: 'Autenticado com sucesso!' });
});

// ==========================================
// 🔒 ROTAS PROTEGIDAS (Apenas Admin)
// ==========================================

// 🟢 Checagem de Autenticação (Usada pelo Next.js)
app.get('/api/auth/check', autenticarAdmin, (req, res) => {
  return res.json({ autenticado: true });
});

// 🔴 Logout (Destrói o Cookie)
app.post('/api/logout', (req, res) => {
  res.clearCookie('admin_token');
  return res.json({ message: 'Sessão encerrada com sucesso!' });
});

// ➕ Cadastrar novo produto
app.post('/api/produtos', autenticarAdmin, async (req, res) => {
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

// 🗑️ Deletar produto pelo ID
app.delete('/api/produtos/:id', autenticarAdmin, async (req, res) => {
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

// ✏️ Atualizar um produto pelo ID
app.put('/api/produtos/:id', autenticarAdmin, async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, categoria, imagem_url } = req.body;

  if (!nome || !preco || !categoria) {
    return res.status(400).json({ error: 'Nome, preço e categoria são obrigatórios.' });
  }

  try {
    const query = `
      UPDATE produtos
      SET nome = $1, descricao = $2, preco = $3, categoria = $4, imagem_url = $5
      WHERE id = $6
      RETURNING *;
    `;
    const valores = [nome, descricao || '', preco, categoria, imagem_url || '', id];
    const resultado = await pool.query(query, valores);

    if (resultado.rowCount === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (erro) {
    console.error('Erro ao atualizar produto:', erro);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// ⏸️ Alternar disponibilidade (Pausar/Ativar produto)
app.patch('/api/produtos/:id/disponibilidade', autenticarAdmin, async (req, res) => {
  const { id } = req.params;
  const { disponivel } = req.body;

  try {
    const resultado = await pool.query(
      'UPDATE produtos SET disponivel = $1 WHERE id = $2 RETURNING *',
      [disponivel, id]
    );
    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error('Erro ao alterar disponibilidade:', erro);
    res.status(500).json({ error: 'Erro ao alterar disponibilidade' });
  }
});

// Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});