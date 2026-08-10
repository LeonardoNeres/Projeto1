'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagem_url: string;
}

export default function AdminPage() {
  const router = useRouter();

  // Estados do Formulário
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('Lanches');
  const [imagemUrl, setImagemUrl] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
const [idParaDeletar, setIdParaDeletar] = useState<number | null>(null);  

  // Estados de Lista e Feedback
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [mensagem, setMensagem] = useState('');

  // 1. Carregar produtos do banco de dados
  const carregarProdutos = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/produtos');
      if (res.ok) {
        const dados = await res.json();
        setProdutos(dados);
      }
    } catch (erro) {
      console.error('Erro ao buscar produtos:', erro);
    } finally {
      setCarregandoLista(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  // 2. Cadastrar Novo Prato (POST)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem('');

    try {
      const resposta = await fetch('http://localhost:5000/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          descricao,
          preco: parseFloat(preco),
          categoria,
          imagem_url: imagemUrl,
        }),
      });

      if (resposta.ok) {
        toast.success('✅ Prato cadastrado com sucesso!');
        // Limpar os campos
        setNome('');
        setDescricao('');
        setPreco('');
        setImagemUrl('');
        // Recarregar a lista atualizada
        carregarProdutos();
      } else {
        toast.error('❌ Erro ao cadastrar prato. Verifique os dados.');
      }
    } catch (erro) {
      console.error(erro);
      toast.error('❌ Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

 // 1. Função que abre o modal guardando o ID do prato
const abrirModalDeletar = (id: number) => {
  setIdParaDeletar(id);
  setModalAberto(true);
};

// 2. Função que realmente deleta no banco quando o usuário clica em "Sim, excluir"
const confirmarDeletar = async () => {
  if (!idParaDeletar) return;

  try {
    const resposta = await fetch(`http://localhost:5000/api/produtos/${idParaDeletar}`, {
      method: 'DELETE',
    });

    if (resposta.ok) {
      toast.success('Prato excluído com sucesso!');
      carregarProdutos();
    } else {
      toast.error('Erro ao excluir o prato.');
    }
  } catch (erro) {
    console.error('Erro ao deletar:', erro);
    toast.error('Erro de conexão ao deletar.');
  } finally {
    setModalAberto(false);
    setIdParaDeletar(null);
  }
};

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif', paddingBottom: '3rem' }}>
      
      {/* Topo / Header do Admin */}
      <header style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', padding: '1rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.3rem', color: '#f59e0b', margin: 0, fontWeight: 'bold' }}>
            ⚙️ Painel de Gestão - DevBurger
          </h1>
          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              backgroundColor: '#38bdf8',
              color: '#0f172a',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            🏠 Ver Cardápio do Cliente
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem', display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* FORMULÁRIO DE CADASTRO */}
        <section style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#f59e0b', marginTop: 0, marginBottom: '1rem' }}>
            ➕ Cadastrar Novo Prato
          </h2>

          {mensagem && (
            <div style={{ padding: '0.8rem', marginBottom: '1rem', borderRadius: '6px', backgroundColor: mensagem.includes('✅') || mensagem.includes('🗑️') ? '#166534' : '#991b1b', color: '#fff' }}>
              {mensagem}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.3rem', fontWeight: 'bold' }}>Nome do Prato *</label>
              <input
                type="text"
                required
                placeholder="Ex: X-Bacon Especial"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.3rem', fontWeight: 'bold' }}>Categoria *</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              >
                <option value="Lanches">Lanches</option>
                <option value="Pizzas">Pizzas</option>
                <option value="Porções">Porções</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Sobremesas">Sobremesas</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.3rem', fontWeight: 'bold' }}>Preço (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="29.90"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.3rem', fontWeight: 'bold' }}>URL da Imagem</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imagemUrl}
                onChange={(e) => setImagemUrl(e.target.value)}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.3rem', fontWeight: 'bold' }}>Descrição</label>
              <textarea
                rows={2}
                placeholder="Ingredientes e detalhes..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                gridColumn: 'span 2',
                backgroundColor: loading ? '#475569' : '#f59e0b',
                color: '#000',
                border: 'none',
                padding: '0.8rem',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                marginTop: '0.5rem'
              }}
            >
              {loading ? 'Salvando...' : 'Salvar Prato no Banco 🚀'}
            </button>

          </form>
        </section>

        {/* LISTAGEM DOS PRATOS NO BANCO */}
        <section style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#f59e0b', marginTop: 0, marginBottom: '1rem' }}>
            📋 Pratos Cadastrados ({produtos.length})
          </h2>

          {carregandoLista ? (
            <p style={{ color: '#94a3b8' }}>Carregando lista de pratos...</p>
          ) : produtos.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>Nenhum prato cadastrado ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {produtos.map((prod) => (
                <div
                  key={prod.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#0f172a',
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #334155'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {prod.categoria}
                    </span>
                    <h3 style={{ margin: '0.2rem 0', fontSize: '1rem' }}>{prod.nome}</h3>
                    <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      R$ {Number(prod.preco).toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => abrirModalDeletar(prod.id)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      padding: '0.5rem 0.8rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                    }}
                  >
                    🗑️ Excluir
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>


      {/* Modal de Confirmação de Exclusão */}
{modalAberto && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>
    <div style={{
      backgroundColor: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: '1.5rem',
      maxWidth: '400px',
      width: '90%',
      textAlign: 'center',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
    }}>
      <h3 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', fontSize: '1.25rem' }}>
        Confirmar Exclusão
      </h3>
      <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
        Tem certeza que deseja excluir este prato? Esta ação não poderá ser desfeita.
      </p>
      
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => setModalAberto(false)}
          style={{
            backgroundColor: '#475569',
            color: '#fff',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={confirmarDeletar}
          style={{
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Sim, excluir
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}