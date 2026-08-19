const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuração do PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Se for banco em nuvem (Render, Supabase, Neon), ative a linha abaixo em produção:
   ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('⚡ Conectado ao banco de dados PostgreSQL!');
});

// 📁 CONFIGURAÇÃO DO MULTER (Upload em Disco)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    // Cria a pasta /uploads se ela ainda não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Nome do arquivo: imagem-TIMESTAMP-NUMEROALEATORIO.extensao
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'imagem-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// Middlewares Globais
app.use(cors({ origin: 'https://devburguer-tau.vercel.app', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// 🌐 Servir arquivos estáticos da pasta /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔑 MIDDLEWARE DE AUTENTICAÇÃO
const autenticarAdmin = (req, res, next) => {
  const token = req.cookies.admin_token;

  if (!token) {
    return res.status(401).json({ error: 'Não autorizado. Faça login primeiro.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'chave_secreta_para_assinar_o_token_12345';
    const decoded = jwt.verify(token, jwtSecret);
    req.admin = decoded;
    next();
  } catch (erro) {
    return res.status(401).json({ error: 'Sessão expirada ou inválida.' });
  }
};

// ==========================================
// 🔓 ROTAS PÚBLICAS
// ==========================================

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

// 2. POST - Login
app.post('/api/login', (req, res) => {
  const { senha } = req.body;
  const senhaCorreta = process.env.ADMIN_PASSWORD || 'admin123';
  const jwtSecret = process.env.JWT_SECRET || 'chave_secreta_para_assinar_o_token_12345';

  if (senha !== senhaCorreta) {
    return res.status(401).json({ error: 'Senha incorreta!' });
  }

  const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: '8h' });

res.cookie('token', token, {
  httpOnly: true,
  secure: true,        // Obrigatório para HTTPS no Render
  sameSite: 'none',    // Permite o cookie entre Vercel e Render
  maxAge: 86400000     // 24 horas
});

  return res.status(200).json({ ok: true, message: 'Autenticado com sucesso!' });
});

// ==========================================
// 🔒 ROTAS PROTEGIDAS (Apenas Admin)
// ==========================================

// 📸 ROTA DE UPLOAD DE IMAGEM
app.post('/api/upload', autenticarAdmin, upload.single('imagem'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  // Gera e retorna a URL acessível da imagem
  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  return res.status(200).json({ url: imageUrl });
});

// 🟢 Checagem de Autenticação
app.get('/api/auth/check', autenticarAdmin, (req, res) => {
  return res.json({ autenticado: true });
});

// 🔴 Logout
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