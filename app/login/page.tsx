'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Envia a senha para o backend validar
      const res = await fetch('https://devburguer-api-7ld2.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ⚠️ OBRIGATÓRIO: Permite receber o Cookie do servidor
        body: JSON.stringify({ senha }),
      });

      if (res.ok) {
        toast.success('Acesso liberado!');
        // Redireciona para o Painel do Admin
        window.location.href = '/admin';
      } else {
        toast.error('Senha incorreta!');
      }
    } catch (err) {
      toast.error('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <form onSubmit={handleLogin} style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px', border: '1px solid #334155', width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <h2 style={{ color: '#f8fafc', margin: 0, textAlign: 'center', fontSize: '1.4rem' }}>
          🔒 Acesso Restrito
        </h2>
        
        <div>
          <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>
            Senha de Administrador:
          </label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite a senha..."
            required
            style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
        >
          {loading ? 'Validando...' : 'Entrar no Painel'}
        </button>
      </form>
    </div>
  );
}