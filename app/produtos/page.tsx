import Link from 'next/link';

// Tipagem dos produtos que vêm da sua API Node
interface Produto {
  id: number;
  nome: string;
  preco: number;
}

export default async function ProdutosPage() {
  // Buscando os dados da SUA API em Node.js (porta 5000)
  const response = await fetch('http://localhost:5000/api/produtos', {
    cache: 'no-store' // Garante que trará sempre os dados atualizados sem guardar em cache
  });
  const produtos: Produto[] = await response.json();

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-slate-900 text-white font-sans">
      <div className="max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-sky-400">
            Produtos do Meu Backend 🛒
          </h1>
          <Link 
            href="/" 
            className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
          >
            ← Voltar
          </Link>
        </div>

        <p className="text-slate-400 text-sm mb-6">
          Dados vindos direto da sua própria API em <code className="text-emerald-400">Node.js + Express</code>!
        </p>

        {/* Renderiza os produtos trazidos da sua API */}
        <div className="space-y-3">
          {produtos.map((item) => (
            <div 
              key={item.id}
              className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex justify-between items-center hover:border-sky-500/50 transition-colors"
            >
              <span className="font-medium text-slate-200">{item.nome}</span>
              <span className="text-emerald-400 font-bold">R$ {item.preco}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}