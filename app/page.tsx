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

interface ItemCarrinho extends Produto {
  quantidade: number;
}

export default function CardapioPublicoPage() {

  useEffect(() => {
  // Garante que o login do admin seja resetado ao estar na home
  sessionStorage.removeItem('admin_logado');
}, []);

  const router = useRouter();

  // Estados dos Produtos e Filtros
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('Todos');
  const [busca, setBusca] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Estados do Carrinho
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState<boolean>(false);

  // Estados do Formulário de Checkout
  const [nomeCliente, setNomeCliente] = useState<string>('');
  const [endereco, setEndereco] = useState<string>('');
  const [formaPagamento, setFormaPagamento] = useState<string>('Pix');
  const [observacao, setObservacao] = useState<string>('');

  // Número do WhatsApp do restaurante (DDI + DDD + Número)
  const NUMERO_WHATSAPP = '5545998586786';

  // 1. Buscar produtos do Back-end
  useEffect(() => {
    async function carregarProdutos() {
      try {
        const res = await fetch('http://localhost:5000/api/produtos');
        if (res.ok) {
          const dados = await res.json();
// Exibe apenas os produtos que NÃO estão pausados (disponivel !== false)
const produtosAtivos = dados.filter((prod: any) => prod.disponivel !== false);
setProdutos(produtosAtivos);        }
      } catch (erro) {
        console.error('Erro ao buscar produtos da API:', erro);
      } finally {
        setLoading(false);
      }
    }
    carregarProdutos();
  }, []);

  // Categorias para os filtros
  const categorias = ['Todos', ...Array.from(new Set(produtos.map((p) => p.categoria)))];

  // Filtro de Busca + Categoria
  const produtosFiltrados = produtos.filter((produto) => {
    const bateCategoria = categoriaSelecionada === 'Todos' || produto.categoria === categoriaSelecionada;
    const bateBusca = produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      (produto.descricao && produto.descricao.toLowerCase().includes(busca.toLowerCase()));
    return bateCategoria && bateBusca;
  });

  // Funções do Carrinho
  const adicionarAoCarrinho = (produto: Produto) => {
    setCarrinho((prev) => {
      const existe = prev.find((item) => item.id === produto.id);
      if (existe) {
        return prev.map((item) =>
          item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });
    toast.success(`${produto.nome} adicionado ao carrinho!`);
  };

  const alterarQuantidade = (id: number, delta: number) => {
    setCarrinho((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const novaQtd = item.quantidade + delta;
            return novaQtd > 0 ? { ...item, quantidade: novaQtd } : null;
          }
          return item;
        })
        .filter(Boolean) as ItemCarrinho[]
    );
  };

  const totalCarrinho = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

  // Formatar e enviar pedido para o WhatsApp
  const finalizarPedido = (e: React.FormEvent) => {
    e.preventDefault();

    if (carrinho.length === 0) {
      toast.error('Seu carrinho está vazio!');
      return;
    }

    if (!nomeCliente || !endereco) {
      toast.error('Por favor, preencha seu nome e endereço de entrega.');
      return;
    }

    let mensagem = `*🚀 NOVO PEDIDO - CARDÁPIO DIGITAL*\n\n`;
    mensagem += `👤 *Cliente:* ${nomeCliente}\n`;
    mensagem += `📍 *Endereço:* ${endereco}\n`;
    mensagem += `💳 *Pagamento:* ${formaPagamento}\n`;
    if (observacao) mensagem += `📝 *Obs:* ${observacao}\n`;

    mensagem += `\n🛒 *ITENS DO PEDIDO:*\n`;
    carrinho.forEach((item) => {
      mensagem += `• ${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2)}\n`;
    });

    mensagem += `\n💰 *TOTAL:* R$ ${totalCarrinho.toFixed(2)}`;

    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif', paddingBottom: '3rem' }}>
      
      {/* Topo / Header */}
      <header style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', padding: '1rem 1.5rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', color: '#f59e0b', margin: 0, fontWeight: 'bold' }}>🍔 DevBurger & Cia</h1>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Faça seu pedido online e receba em casa</p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => router.push('/admin')}
              style={{ backgroundColor: '#334155', color: '#cbd5e1', border: 'none', padding: '0.5rem 0.9rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              ⚙️ Admin
            </button>
            <button
              type="button"
              onClick={() => setCarrinhoAberto(true)}
              style={{ backgroundColor: '#f59e0b', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              🛒 Carrinho ({totalItens})
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '1.5rem auto', padding: '0 1rem' }}>
        
        {/* Busca e Filtros */}
        <section style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="🔍 Buscar lanche, bebida ou sobremesa..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '1rem', boxSizing: 'border-box', marginBottom: '1rem' }}
          />

          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {categorias.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaSelecionada(cat)}
                style={{
                  backgroundColor: categoriaSelecionada === cat ? '#f59e0b' : '#1e293b',
                  color: categoriaSelecionada === cat ? '#000' : '#cbd5e1',
                  border: '1px solid #334155',
                  padding: '0.5rem 1.2rem',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

       {/* Lista de Produtos */}
{loading ? (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
    {[1, 2, 3, 4, 5, 6].map((n) => (
      <div
        key={n}
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          overflow: 'hidden',
          height: '320px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1rem',
          boxSizing: 'border-box'
        }}
      >
        <div className="skeleton" style={{ width: '100%', height: '140px', borderRadius: '8px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
          <div className="skeleton" style={{ width: '30%', height: '12px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ width: '70%', height: '20px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ width: '100%', height: '14px', borderRadius: '4px' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ width: '100px', height: '36px', borderRadius: '6px' }} />
        </div>
      </div>
    ))}
  </div>
) : produtosFiltrados.length === 0 ? (
  <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '3rem' }}>Nenhum item encontrado.</p>
) : (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
    {produtosFiltrados.map((prod) => (
      <div
        key={prod.id}
        style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
      >
        {prod.imagem_url && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={prod.imagem_url}
            alt={prod.nome}
            style={{ width: '100%', height: '160px', objectFit: 'cover' }}
          />
        )}
        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {prod.categoria}
            </span>
            <h3 style={{ margin: '0.3rem 0', fontSize: '1.1rem', color: '#f8fafc' }}>{prod.nome}</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1rem 0' }}>{prod.descricao}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#38bdf8' }}>
              R$ {Number(prod.preco).toFixed(2)}
            </span>
            <button
              type="button"
              onClick={() => adicionarAoCarrinho(prod)}
              style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              + Adicionar
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
      </main>

      {/* Sidebar do Carrinho */}
      {carrinhoAberto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#1e293b', height: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#f59e0b' }}>🛒 Seu Carrinho</h2>
              <button
                type="button"
                onClick={() => setCarrinhoAberto(false)}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Lista dos Itens no Carrinho */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.3rem' }}>
              {carrinho.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '2rem' }}>Seu carrinho está vazio.</p>
              ) : (
                carrinho.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{item.nome}</h4>
                      <span style={{ fontSize: '0.85rem', color: '#38bdf8' }}>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => alterarQuantidade(item.id, -1)}
                        style={{ width: '28px', height: '28px', borderRadius: '4px', border: 'none', backgroundColor: '#334155', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{item.quantidade}</span>
                      <button
                        type="button"
                        onClick={() => alterarQuantidade(item.id, 1)}
                        style={{ width: '28px', height: '28px', borderRadius: '4px', border: 'none', backgroundColor: '#334155', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Form */}
            {carrinho.length > 0 && (
              <form onSubmit={finalizarPedido} style={{ borderTop: '1px solid #334155', paddingTop: '1rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc' }}>Dados para Entrega:</h3>

                <input
                  type="text"
                  required
                  placeholder="Seu Nome completo *"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                />

                <input
                  type="text"
                  required
                  placeholder="Rua, Número e Bairro *"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                />

                <select
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="Pix">Pagamento: Pix</option>
                  <option value="Cartão de Crédito/Débito">Pagamento: Cartão na Entrega</option>
                  <option value="Dinheiro">Pagamento: Dinheiro</option>
                </select>

                <input
                  type="text"
                  placeholder="Observação (Ex: Sem cebola)"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>Total:</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#38bdf8' }}>R$ {totalCarrinho.toFixed(2)}</span>
                </div>

                <button
                  type="submit"
                  style={{ backgroundColor: '#25d366', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  📲 Enviar Pedido no WhatsApp
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}