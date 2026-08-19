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

// Lista de origens permitidas
const allowedOrigins = [
  'https://devburguer-tau.vercel.app',
  'http://localhost:3000'
];

// Configuração do CORS (Corrigido para aceitar credenciais/cookies)
app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origem (como apps mobile ou curl) e domínios da lista
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Libera outras variações da Vercel
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(cookieParser());

// Configuração do PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('⚡ Conectado ao banco de dados PostgreSQL!');
});

// 📁 CONFIGURAÇÃO DO MULTER (Upload em Disco)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'imagem-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

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

  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: true,        // Obrigatório para HTTPS na Vercel / Render
    sameSite: 'none',    // Necessário para compartilhar cookies entre origens diferentes
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

  const protocol = req.protocol;
  const host = req.get('host');
  const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
  
  return res.status(200).json({ url: imageUrl });
});

// 🟢 Checagem de Autenticação
app.get('/api/auth/check', autenticarAdmin, (req, res) => {
  return res.json({ autenticado: true });
});

// 🔴 Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
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