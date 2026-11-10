import { useEffect, useState, type FormEvent } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/authSlice';
import { Logo, SearchIcon } from './Icons';

const links = [
  { to: '/', label: 'Home' },
  { to: '/tv', label: 'TV Shows' },
  { to: '/genres', label: 'Genres' },
  { to: '/my-list', label: 'My List' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // keep the box in sync when the URL changes (back button, new search)
  useEffect(() => { setQ(params.get('q') ?? ''); }, [params]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled ? 'bg-surface/95 shadow-lg backdrop-blur' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 items-center gap-6 px-4 md:px-12">
        <Link to="/"><Logo /></Link>

        <ul className="hidden gap-5 text-sm md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end
                className={({ isActive }) =>
                  `transition hover:text-gray-300 ${isActive ? 'font-semibold text-white' : 'text-gray-300'}`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <form onSubmit={submit} className="ml-auto flex items-center rounded-md border border-white/20 bg-black/40 px-2">
          <SearchIcon className="h-4 w-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Titles, people, genres"
            className="w-28 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-gray-500 sm:w-56"
            aria-label="Search"
          />
        </form>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-brand font-bold uppercase"
            aria-label="Account menu"
          >
            {user?.name?.[0] ?? '?'}
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md border border-white/10 bg-zinc-900 py-2 text-sm shadow-xl">
              <p className="truncate px-4 pb-2 text-gray-400">{user?.email}</p>
              {links.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} className="block px-4 py-1.5 hover:bg-white/10 md:hidden">
                  {l.label}
                </Link>
              ))}
              <button
                onClick={() => { dispatch(logout()); navigate('/login'); }}
                className="block w-full px-4 py-1.5 text-left hover:bg-white/10"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
