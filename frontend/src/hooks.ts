import { useCallback, useEffect, useRef, useState } from 'react';
import { addToWatchlist, fetchWatchlist, removeFromWatchlist } from './store/watchlistSlice';
import { useAppDispatch, useAppSelector } from './store';
import { mediaTypeOf, titleOf } from './api/client';
import type { Title } from './types';

/** Generic data-fetching hook with loading / error state and stale-response protection. */
export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setError('Could not load content'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Returns true once the element has scrolled near the viewport (used to lazy-load rows). */
export function useInView<T extends Element>(rootMargin = '300px') {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current || inView) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { rootMargin });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [inView, rootMargin]);
  return { ref, inView };
}

/** My List state + toggle for a single title. */
export function useMyList(title: Title | null) {
  const dispatch = useAppDispatch();
  const { items, loaded } = useAppSelector((s) => s.watchlist);

  useEffect(() => {
    if (!loaded) dispatch(fetchWatchlist());
  }, [loaded, dispatch]);

  const mediaType = title ? mediaTypeOf(title) : 'movie';
  const inList = !!title && items.some((i) => i.titleId === title.id && i.mediaType === mediaType);

  const toggle = useCallback(async () => {
    if (!title) return;
    try {
      if (inList) {
        await dispatch(removeFromWatchlist({ mediaType, titleId: title.id })).unwrap();
      } else {
        await dispatch(addToWatchlist({
          titleId: title.id,
          mediaType,
          title: titleOf(title),
          posterPath: title.poster_path,
          backdropPath: title.backdrop_path,
          voteAverage: title.vote_average,
        })).unwrap();
      }
    } catch {
      dispatch(fetchWatchlist()); // resync with server after a failed optimistic update
    }
  }, [dispatch, inList, mediaType, title]);

  return { inList, toggle };
}
