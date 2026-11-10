import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import { DetailModalProvider } from './components/DetailModalContext';
import AuthPage from './pages/AuthPage';
import { useAppDispatch, useAppSelector } from './store';
import { restoreSession } from './store/authSlice';

// Code-split pages -> smaller initial bundle
const HomePage = lazy(() => import('./pages/HomePage'));
const GenresPage = lazy(() => import('./pages/GenresPage'));
const TvPage = lazy(() => import('./pages/TvPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const MyListPage = lazy(() => import('./pages/MyListPage'));

function FullScreenLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent" />
    </div>
  );
}

/** Layout for signed-in pages. Redirects to /login if there is no session. */
function ProtectedLayout() {
  const user = useAppSelector((s) => s.auth.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;

  return (
    <DetailModalProvider>
      <Navbar />
      <Suspense fallback={<FullScreenLoader />}>
        <Outlet />
      </Suspense>
      <footer className="px-4 py-10 text-center text-xs text-gray-500 md:px-12">
        CineStream, a portfolio project. Show data and images from TVmaze.com (CC BY-SA).
      </footer>
    </DetailModalProvider>
  );
}

export default function App() {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);

  // Restore a saved session once, before rendering any routes
  useEffect(() => {
    dispatch(restoreSession()).finally(() => setReady(true));
  }, [dispatch]);

  if (!ready) return <FullScreenLoader />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/genres" element={<GenresPage />} />
          <Route path="/tv" element={<TvPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/my-list" element={<MyListPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
