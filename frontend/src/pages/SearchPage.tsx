import { useSearchParams } from 'react-router-dom';
import TitleCard from '../components/TitleCard';
import { movieApi } from '../api/client';
import { useDebounce, useFetch } from '../hooks';
import type { PagedResponse, Title } from '../types';

const empty: PagedResponse<Title> = { page: 1, results: [], total_pages: 0, total_results: 0 };

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = useDebounce((params.get('q') ?? '').trim(), 300);

  const { data, loading, error } = useFetch(
    () => (q ? movieApi.search(q) : Promise.resolve(empty)),
    [q],
  );

  // /search/multi also returns people -> keep only movies & tv with a poster
  const results = (data?.results ?? []).filter((t) => t.media_type !== 'person' && t.poster_path);

  return (
    <div className="min-h-screen px-4 pb-16 pt-24 md:px-12">
      <h1 className="mb-6 text-2xl font-semibold">
        {q ? <>Results for <span className="text-brand">“{q}”</span></> : 'Search for a movie or show'}
      </h1>

      {loading && q && <p className="text-gray-400">Searching…</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && q && results.length === 0 && (
        <p className="text-gray-400">No matches. Try a different title.</p>
      )}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
        {results.map((t) => (
          <div key={`${t.media_type}-${t.id}`} className="[&>button]:w-full">
            <TitleCard title={t} />
          </div>
        ))}
      </div>
    </div>
  );
}
