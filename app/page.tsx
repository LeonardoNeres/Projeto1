'use client';

import { useState } from 'react';
import Link from 'next/link'; // Importante para navegação rápida!

export default function Home() {
  const [contador, setContador] = useState(0);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-900 text-white font-sans gap-6">
      <div className="p-8 bg-slate-800 rounded-2xl shadow-xl border border-slate-700 text-center max-w-sm w-full">
        <h1 className="text-2xl font-bold text-sky-400 mb-2">
          Contador Next.js
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Testando estado com <code className="text-emerald-400">useState</code>
        </p>

        <div className="text-6xl font-black text-white mb-6">
          {contador}
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => setContador(contador - 1)}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 font-bold rounded-lg transition-colors active:scale-95"
          >
            - 1
          </button>

          <button
            onClick={() => setContador(0)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-lg transition-colors active:scale-95"
          >
            Zerar
          </button>

          <button
            onClick={() => setContador(contador + 1)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg transition-colors active:scale-95"
          >
            + 1
          </button>
        </div>
      </div>

      {/* Botão para navegar para a página /sobre */}
      <Link 
        href="/sobre"
        className="text-slate-400 hover:text-sky-400 text-sm underline transition-colors"
      >
        Ir para a página Sobre →
      </Link>
      <Link 
  href="/posts"
  className="text-slate-400 hover:text-sky-400 text-sm underline transition-colors"
>
  Ver Posts da API →
</Link>
<Link 
  href="/produtos"
  className="text-slate-400 hover:text-sky-400 text-sm underline transition-colors"
>
  Ver Produtos da Minha API (Node.js) →
</Link>
    </main>
  );
}