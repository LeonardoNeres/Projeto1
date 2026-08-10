# 🍔 DevBurger - Cardápio Digital & Painel de Gestão

O **DevBurger** é uma aplicação web Full-Stack desenvolvida para conectar clientes ao cardápio de uma hamburgueria artesanal de forma dinâmica, acompanhada de um **Painel Administrativo completo** para gestão do estabelecimento em tempo real.

---

## 🎯 Finalidade do Projeto

O objetivo principal do projeto foi construir uma solução real de ponto de venda e gestão de produtos para estabelecimentos alimentícios, aplicando conceitos avançados de **desenvolvimento Full-Stack**, **autenticação segura via Cookies HttpOnly**, **upload de arquivos em disco** e **persistência de dados em banco relacional**.

---

## 🚀 Como Funciona

1. **Cardápio do Cliente (Front-end):**
   * Exibição de produtos divididos por categorias (*Lanches, Pizzas, Porções, Bebidas, Sobremesas*).
   * Atualização em tempo real conforme as alterações feitas no painel administrativo.

2. **Painel do Administrador (`/admin`):**
   * **Autenticação Protegida:** Acesso restrito via login com geração de token JWT armazenado em Cookie de Sessão `HttpOnly`.
   * **Cadastro e Edição de Pratos:** Formulário completo com upload de imagens diretamente do dispositivo (PC/Celular) ou via link.
   * **Controle de Disponibilidade:** Botão para pausar ou ativar produtos instantaneamente no cardápio sem precisar deletá-los.
   * **Gestão de Produtos (CRUD):** Exclusão com confirmação visual via Modal e edição completa de valores, nomes e descrições.

---

## 🛠️ Tecnologias e Ferramentas Utilizadas

### **Front-end**
* **[Next.js (App Router)](https://nextjs.org/):** Framework React para renderização e rotas.
* **[React](https://react.dev/):** Biblioteca para construção da interface de usuário.
* **[TypeScript](https://www.typescriptlang.org/):** Tipagem estática para maior segurança no código.
* **[React Hot Toast](https://react-hot-toast.com/):** Notificações visuais modernas para o usuário.

### **Back-end**
* **[Node.js](https://nodejs.org/) & [Express](https://expressjs.com/):** Servidor HTTP e construção de APIs RESTful.
* **[PostgreSQL](https://www.postgresql.org/):** Banco de dados relacional para armazenamento de produtos.
* **[Multer](https://github.com/expressjs/multer):** Middleware para manuseio e upload de arquivos de imagem (`multipart/form-data`).
* **[JSON Web Token (JWT)](https://jwt.io/) & Cookie-Parser:** Sistema de autenticação seguro.

---

## 💻 Como Rodar o Projeto Localmente

Como a aplicação ainda está em fase de desenvolvimento e não foi implantada na nuvem, siga os passos abaixo para executá-la na sua máquina:

### **1. Pré-requisitos**
* Node.js instalado (versão 18 ou superior)
* Banco de dados PostgreSQL rodando localmente ou na nuvem

---

### **2. Configuração do Back-end**

1. Em um novo terminal, vá para a pasta do front-end Next.js:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Execute o ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Abra o seu navegador e acesse:
   * **Cardápio:** `http://localhost:3000`
   * **Login Admin:** `http://localhost:3000/login`
