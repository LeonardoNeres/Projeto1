'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CadastrarPratoPage() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('Lanches');
  const [imagemUrl, setImagemUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem('');

    try {
      const resposta = await fetch('http://localhost:5000/api/produtos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          descricao,
          preco: parseFloat(preco),
          categoria,
          imagem_url: imagemUrl,
        }),
      });

      if (resposta.ok) {
        setMensagem('✅ Prato cadastrado com sucesso!');
        setTimeout(() => {
          router.push('/produtos');
        }, 1500);
      } else {
        setMensagem('❌ Erro ao cadastrar prato. Verifique os campos.');
      }
    } catch (erro) {
      console.error(erro);
      setMensagem('❌ Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* Topo simples e direto com os botões bem visíveis */}
      <header style={{ padding: '1rem 2rem', backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          


          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              backgroundColor: '#334155',
              color: '#ffffff',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            🏠 Home
          </button>

        </div>
      </header>

      {/* Formulário */}
      <main style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
        
        <h1 style={{ fontSize: '1.8rem', color: '#f59e0b', marginBottom: '1.5rem', textAlign: 'center' }}>
          ➕ Cadastrar Novo Prato
        </h1>

        <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px', border: '1px solid #334155' }}>
          
          {mensagem && (
            <div style={{ padding: '0.8rem', marginBottom: '1.5rem', borderRadius: '6px', backgroundColor: mensagem.includes('✅') ? '#166534' : '#991b1b', color: '#fff', textAlign: 'center' }}>
              {mensagem}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Nome do Prato */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#cbd5e1', fontWeight: 'bold' }}>
                Nome do Prato *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: X-Salada Especial"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            {/* Categoria e Preço */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#cbd5e1', fontWeight: 'bold' }}>
                  Categoria *
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="Lanches">Lanches</option>
                  <option value="Pizzas">Pizzas</option>
                  <option value="Porções">Porções</option>
                  <option value="Bebidas">Bebidas</option>
                  <option value="Sobremesas">Sobremesas</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#cbd5e1', fontWeight: 'bold' }}>
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="29.90"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#cbd5e1', fontWeight: 'bold' }}>
                Descrição
              </label>
              <textarea
                rows={3}
                placeholder="Descreva os ingredientes..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            {/* URL da Imagem */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#cbd5e1', fontWeight: 'bold' }}>
                URL da Imagem (Link da foto)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imagemUrl}
                onChange={(e) => setImagemUrl(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            {/* Botão Salvar */}
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#475569' : '#f59e0b',
                color: '#000',
                border: 'none',
                padding: '0.85rem',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '1rem'
              }}
            >
              {loading ? 'Cadastrando no Banco...' : 'Salvar Prato no Banco 🚀'}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}