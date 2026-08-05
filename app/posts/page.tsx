import Link from 'next/link';

// Definição do tipo dos dados que vem da API
interface Post {
  id: number;
  title: string;
  body: string;
}

// No Next.js App Router, componentes de servidor podem ser 'async'!
export default async function PostsPage() {
  // Fazendo o fetch direto no Server Component (muito mais rápido e seguro)
  const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
  const posts: Post[] = await response.json();

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-slate-900 text-white font-sans">
      <div className="max-w-2xl w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-sky-400">
            Lista de Posts (API) 📡
          </h1>
          <Link 
            href="/"
            className="text-xs px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
          >
            ← Voltar
          </Link>
        </div>

        <p className="text-slate-400 text-sm mb-6">
          Estes dados estão sendo buscados no servidor (*Server-Side Fetching*) antes de enviar o HTML pronto para a sua tela!
        </p>

        {/* Renderizando a lista de posts */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="p-5 bg-slate-800 rounded-xl border border-slate-700 hover:border-sky-500/50 transition-colors"
            >
              <h2 className="text-lg font-semibold text-emerald-400 capitalize mb-2">
                {post.id}. {post.title}
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                {post.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}