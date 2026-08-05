import Link from 'next/link';

export default function Sobre() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-900 text-white font-sans">
      <div className="p-8 bg-slate-800 rounded-2xl shadow-xl border border-slate-700 text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-sky-400 mb-4">
          Página Sobre ℹ️
        </h1>
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          Esta é a segunda rota da aplicação. No Next.js, basta criar uma pasta e colocar um arquivo <code className="text-emerald-400">page.tsx</code> dentro dela!
        </p>

        {/* Componente de navegação do Next.js */}
        <Link 
          href="/"
          className="inline-block px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg transition-colors"
        >
          ← Voltar para a Home
        </Link>
      </div>
    </main>
  );
}