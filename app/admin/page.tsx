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

  // Trava de Autorização
  const [autorizado, setAutorizado] = useState(false);

  // Estados do Formulário
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('Lanches');
  const [imagemUrl, setImagemUrl] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [idParaDeletar, setIdParaDeletar] = useState<number | null>(null);  
  const [produtoEditando, setProdutoEditando] = useState<any | null>(null);

  // Estados de Lista e Feedback
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [mensagem, setMensagem] = useState('');

  // 🔑 1. VERIFICAÇÃO DE SEGURANÇA VIA COOKIE HTTPONLY
  useEffect(() => {
    const checarAutenticacao = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/check', {
          method: 'GET',
          credentials: 'include', // Envia o cookie HttpOnly para o servidor validar
        });

        if (res.ok) {
          setAutorizado(true);
        } else {
          window.location.href = '/login';
        }
      } catch (erro) {
        window.location.href = '/login';
      }
    };

    checarAutenticacao();
  }, []);

  // 2. Carregar produtos do banco de dados (Apenas se autorizado)
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
    if (autorizado) {
      carregarProdutos();
    }
  }, [autorizado]);

  // 🚪 Função de Logout
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/login';
    } catch (erro) {
      toast.error('Erro ao encerrar sessão.');
    }
  };

  // 3. Cadastrar Novo Prato (POST Protegido)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem('');

    try {
      const resposta = await fetch('http://localhost:5000/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 👈 Exige cookie HttpOnly
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
        setNome('');
        setDescricao('');
        setPreco('');
        setImagemUrl('');
        carregarProdutos();
      } else {
        toast.error('❌ Erro ao cadastrar prato. Não autorizado.');
      }
    } catch (erro) {
      console.error(erro);
      toast.error('❌ Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Modal Deletar
  const abrirModalDeletar = (id: number) => {
    setIdParaDeletar(id);
    setModalAberto(true);
  };

  // 4. Confirmar Exclusão (DELETE Protegido)
  const confirmarDeletar = async () => {
    if (!idParaDeletar) return;

    try {
      const resposta = await fetch(`http://localhost:5000/api/produtos/${idParaDeletar}`, {
        method: 'DELETE',
        credentials: 'include', // 👈 Exige cookie HttpOnly
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

  // 5. Salvar Edição (PUT Protegido)
  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoEditando) return;

    try {
      const resposta = await fetch(`http://localhost:5000/api/produtos/${produtoEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 👈 Exige cookie HttpOnly
        body: JSON.stringify(produtoEditando),
      });

      if (resposta.ok) {
        toast.success('Prato atualizado com sucesso!');
        setProdutoEditando(null);
        carregarProdutos();
      } else {
        toast.error('Erro ao atualizar o prato.');
      }
    } catch (erro) {
      console.error('Erro ao editar:', erro);
      toast.error('Erro de conexão ao atualizar.');
    }
  };

  // 6. Alternar Disponibilidade (PATCH Protegido)
  const alternarDisponibilidade = async (id: number, disponivelAtual: boolean) => {
    try {
      const resposta = await fetch(`http://localhost:5000/api/produtos/${id}/disponibilidade`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 👈 Exige cookie HttpOnly
        body: JSON.stringify({ disponivel: !disponivelAtual }),
      });

      if (resposta.ok) {
        toast.success(!disponivelAtual ? 'Prato ativado!' : 'Prato pausado!');
        carregarProdutos();
      } else {
        toast.error('Erro ao mudar status.');
      }
    } catch (erro) {
      toast.error('Erro de conexão.');
    }
  };

  // Enquanto não confirma a validação do Cookie no backend, não renderiza a tela
  if (!autorizado) {
    return null;
  }

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
  onClick={async () => {
    // 1. Destrói o cookie no servidor
    await fetch('http://localhost:5000/api/logout', {
      method: 'POST',
      credentials: 'include',
    });
    // 2. Voltar para a Home
    window.location.href = '/';
  }}
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
  🏠 Cardápio
</button>
  </div>
</header>

      <main style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem', display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* FORMULÁRIO DE CADASTRO */}
        <section style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#f59e0b', marginTop: 0, marginBottom: '1rem' }}>
            ➕ Cadastrar Novo Prato
          </h2>

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

        {/* LISTAGEM DOS PRATOS */}
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
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    padding: '1rem 1.2rem',
                    marginBottom: '0.8rem',
                    border: '1px solid #334155',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {prod.categoria}
                    </span>
                    <h3 style={{ margin: '0.2rem 0', fontSize: '1.05rem', color: '#f8fafc' }}>
                      {prod.nome}
                    </h3>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#38bdf8' }}>
                      R$ {Number(prod.preco).toFixed(2)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => abrirModalDeletar(prod.id)}
                      style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                    >
                      🗑️ Excluir
                    </button>

                    <button
                      type="button"
                      onClick={() => alternarDisponibilidade(prod.id, (prod as any).disponivel !== false)}
                      style={{ backgroundColor: (prod as any).disponivel === false ? '#64748b' : '#10b981', color: '#fff', border: 'none', padding: '0.5rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                    >
                      {(prod as any).disponivel === false ? '🔴 Pausado' : '🟢 Ativo'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setProdutoEditando(prod)}
                      style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '0.5rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                    >
                      ✏️ Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* MODAL DE DELEÇÃO */}
      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>Confirmar Exclusão</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Tem certeza que deseja excluir este prato?</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button type="button" onClick={() => setModalAberto(false)} style={{ backgroundColor: '#475569', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
              <button type="button" onClick={confirmarDeletar} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Sim, excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO */}
      {produtoEditando && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', maxWidth: '500px', width: '90%' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#f8fafc', textAlign: 'center' }}>✏️ Editar Prato</h3>
            <form onSubmit={handleSalvarEdicao} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Nome:</label>
                <input type="text" value={produtoEditando.nome} onChange={(e) => setProdutoEditando({ ...produtoEditando, nome: e.target.value })} required style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Categoria:</label>
                <input type="text" value={produtoEditando.categoria} onChange={(e) => setProdutoEditando({ ...produtoEditando, categoria: e.target.value })} required style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Preço (R$):</label>
                <input type="number" step="0.01" value={produtoEditando.preco} onChange={(e) => setProdutoEditando({ ...produtoEditando, preco: e.target.value })} required style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>URL da Imagem:</label>
                <input type="text" value={produtoEditando.imagem_url || ''} onChange={(e) => setProdutoEditando({ ...produtoEditando, imagem_url: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Descrição:</label>
                <textarea value={produtoEditando.descricao || ''} onChange={(e) => setProdutoEditando({ ...produtoEditando, descricao: e.target.value })} rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setProdutoEditando(null)} style={{ backgroundColor: '#475569', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
                <button type="submit" style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}