import axios, { AxiosError } from 'axios';
import type {
  AuthResponse, Genre, MediaType, PagedResponse, Title, TitleDetails, User, WatchlistItem,
} from '../types';

const TOKEN_KEY = 'cinestream_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ''}/api`,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, drop the token and send the user to login
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401 && !err.config?.url?.startsWith('/auth/')) {
      tokenStorage.clear();
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as { message?: string } | undefined)?.message;
    return msg ?? err.message;
  }
  return 'Something went wrong';
}

// ---------- Auth ----------
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),
  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { name, email, password }).then((r) => r.data),
  me: () => api.get<User>('/auth/me').then((r) => r.data),
};

// ---------- Movies ----------
export type Category =
  | 'trending' | 'originals' | 'top_rated' | 'popular' | 'now_playing' | 'upcoming' | 'popular_tv';

export const movieApi = {
  category: (c: Category, page = 1) =>
    api.get<PagedResponse<Title>>(`/movies/category/${c}`, { params: { page } }).then((r) => r.data),
  genres: () => api.get<{ genres: Genre[] }>('/movies/genres').then((r) => r.data.genres),
  byGenre: (genre: string, page = 1) =>
    api.get<PagedResponse<Title>>(`/movies/genre/${encodeURIComponent(genre)}`, { params: { page } }).then((r) => r.data),
  details: (type: MediaType, id: number) =>
    api.get<TitleDetails>(`/movies/${type}/${id}`).then((r) => r.data),
  search: (q: string, page = 1) =>
    api.get<PagedResponse<Title>>('/movies/search', { params: { q, page } }).then((r) => r.data),
};

// ---------- My List ----------
export const watchlistApi = {
  list: () => api.get<WatchlistItem[]>('/my-list').then((r) => r.data),
  add: (item: Omit<WatchlistItem, 'addedAt'>) =>
    api.post<WatchlistItem>('/my-list', item).then((r) => r.data),
  remove: (type: MediaType, id: number) => api.delete(`/my-list/${type}/${id}`),
};

// ---------- Helpers ----------
export const IMG = {
  // The backend sends full image URLs (TVmaze). Size hints are kept for API compatibility.
  poster: (p: string | null, _size?: string) => p ?? '',
  backdrop: (p: string | null, _size?: string) => p ?? '',
};

export const titleOf = (t: Title) => t.title ?? t.name ?? 'Untitled';
export const yearOf = (t: Title) => (t.release_date ?? t.first_air_date ?? '').slice(0, 4);
/** Items without media_type are inferred from their fields. */
export const mediaTypeOf = (t: Title): MediaType =>
  t.media_type === 'tv' || (!t.title && t.name) ? 'tv' : 'movie';
