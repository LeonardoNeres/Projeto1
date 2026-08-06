'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: string | number;
  categoria: string;
  imagem_url: string;
}

export default function CardapioPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/produtos')
      .then((res) => res.json())
      .then((dados) => {
        setProdutos(dados);
        setLoading(false);
      })
      .catch((erro) => {
        console.error('Erro ao carregar cardápio:', erro);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      {/* Header do Restaurante */}
      <header style={{ padding: '2rem 1rem', textAlign: 'center', borderBottom: '1px solid #1e293b', backgroundColor: '#1e293b' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#f59e0b', margin: 0 }}>🍔 Sabor & Arte Bistro</h1>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Cardápio Digital conectado ao PostgreSQL na Nuvem</p>
  <Link href="/admin" style={{ color: '#f59e0b', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>
    ➕ Cadastrar Novo Prato
  </Link>
      </header>

      {/* Conteúdo Principal */}
      <main style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
        <h2 style={{ fontSize: '1.8rem', borderBottom: '2px solid #f59e0b', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
          Nossos Pratos e Bebidas
        </h2>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>Carregando delícias do banco de dados...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {produtos.map((prato) => (
              <div 
                key={prato.id} 
                style={{ 
                  backgroundColor: '#1e293b', 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  border: '1px solid #334155',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {prato.imagem_url && (
                  <img 
                    src={prato.imagem_url} 
                    alt={prato.nome} 
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }} 
                  />
                )}
                <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#f59e0b', fontWeight: 'bold' }}>
                    {prato.categoria}
                  </span>
                  <h3 style={{ fontSize: '1.3rem', margin: '0.4rem 0', color: '#ffffff' }}>{prato.nome}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', flexGrow: 1, lineHeight: '1.4' }}>
                    {prato.descricao}
                  </p>
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#4ade80' }}>
                      R$ {Number(prato.preco).toFixed(2)}
                    </span>
                    <button style={{ backgroundColor: '#f59e0b', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Pedir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}