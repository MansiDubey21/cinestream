import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import TitleCard from '../components/TitleCard';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchWatchlist } from '../store/watchlistSlice';
import type { Title } from '../types';

export default function MyListPage() {
  const dispatch = useAppDispatch();
  const { items, loaded } = useAppSelector((s) => s.watchlist);

  useEffect(() => { dispatch(fetchWatchlist()); }, [dispatch]);

  // Map stored items back to the Title shape the cards & modal use
  const titles: Title[] = items.map((i) => ({
    id: i.titleId,
    media_type: i.mediaType,
    title: i.mediaType === 'movie' ? i.title : undefined,
    name: i.mediaType === 'tv' ? i.title : undefined,
    overview: '',
    poster_path: i.posterPath,
    backdrop_path: i.backdropPath,
    vote_average: i.voteAverage ?? 0,
  }));

  return (
    <div className="min-h-screen px-4 pb-16 pt-24 md:px-12">
      <h1 className="mb-6 text-3xl font-bold">My List</h1>

      {!loaded && <p className="text-gray-400">Loading…</p>}
      {loaded && titles.length === 0 && (
        <div className="mt-16 text-center text-gray-400">
          <p className="mb-4">You haven't added any titles yet.</p>
          <Link to="/" className="rounded-md bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-dark">
            Browse titles
          </Link>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
        {titles.map((t) => (
          <div key={`${t.media_type}-${t.id}`} className="[&>button]:w-full">
            <TitleCard title={t} />
          </div>
        ))}
      </div>
    </div>
  );
}
