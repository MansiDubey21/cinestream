import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Logo } from '../components/Icons';
import { useAppDispatch, useAppSelector } from '../store';
import { clearError, login, register } from '../store/authSlice';

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const dispatch = useAppDispatch();
  const { user, status, error } = useAppSelector((s) => s.auth);
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => { dispatch(clearError()); }, [mode, dispatch]);

  if (user) {
    const from = (location.state as { from?: string } | null)?.from ?? '/';
    return <Navigate to={from} replace />;
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'login') dispatch(login({ email: form.email, password: form.password }));
    else dispatch(register(form));
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const input = 'w-full rounded-md border border-white/10 bg-zinc-800/80 px-4 py-3 outline-none transition focus:border-brand';

  return (
    <div className="relative flex min-h-screen flex-col bg-[radial-gradient(ellipse_at_top,_#3b0764_0%,_#0b0b10_60%)]">
      <header className="px-6 py-6 md:px-12"><Logo /></header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-xl bg-black/70 p-8 shadow-2xl backdrop-blur md:p-12">
          <h1 className="mb-4 text-3xl font-bold">{mode === 'login' ? 'Sign In' : 'Create Account'}</h1>

          {error && <p className="rounded-md bg-red-500/20 px-4 py-2 text-sm text-red-300">{error}</p>}

          {mode === 'register' && (
            <input className={input} placeholder="Name" value={form.name} onChange={set('name')} required maxLength={80} />
          )}
          <input className={input} type="email" placeholder="Email" value={form.email} onChange={set('email')} required autoComplete="email" />
          <input
            className={input}
            type="password"
            placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={set('password')}
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-md bg-brand py-3 font-semibold transition hover:bg-brand-dark disabled:opacity-60"
          >
            {status === 'loading' ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>

          <p className="pt-2 text-sm text-gray-400">
            {mode === 'login' ? (
              <>New to CineStream? <Link to="/register" className="text-white hover:underline">Sign up now</Link></>
            ) : (
              <>Already have an account? <Link to="/login" className="text-white hover:underline">Sign in</Link></>
            )}
          </p>
        </form>
      </main>
    </div>
  );
}
