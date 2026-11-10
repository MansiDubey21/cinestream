import { useMemo } from 'react';
import { IMG, titleOf } from '../api/client';
import { useFetch, useMyList } from '../hooks';
import type { PagedResponse, Title } from '../types';
import { useDetailModal } from './DetailModalContext';
import { CheckIcon, InfoIcon, PlayIcon, PlusIcon } from './Icons';

/** Big banner featuring a random title from the given list. */
export default function Hero({ load }: { load: () => Promise<PagedResponse<Title>> }) {
  const { data, loading } = useFetch(load, []);
  const { open } = useDetailModal();

  const featured = useMemo(() => {
    const pool = (data?.results ?? []).filter((t) => t.backdrop_path && t.overview);
    return pool.length ? pool[Math.floor(Math.random() * Math.min(pool.length, 10))] : null;
  }, [data]);

  const { inList, toggle } = useMyList(featured);

  if (loading || !featured) {
    return <div className="h-[70vh] w-full animate-pulse bg-zinc-900" />;
  }

  return (
    <section className="relative h-[75vh] min-h-[480px] w-full">
      <img
        src={IMG.backdrop(featured.backdrop_path, 'original')}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-surface to-transparent" />

      <div className="relative flex h-full max-w-2xl flex-col justify-center gap-4 px-4 pt-16 md:px-12">
        <h1 className="text-4xl font-extrabold drop-shadow md:text-6xl">{titleOf(featured)}</h1>
        <p className="line-clamp-3 text-sm text-gray-200 md:text-base">{featured.overview}</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => open(featured, true)} className="flex items-center gap-2 rounded-md bg-white px-6 py-2.5 font-semibold text-black transition hover:bg-white/80">
            <PlayIcon /> Play Trailer
          </button>
          <button onClick={() => open(featured)} className="flex items-center gap-2 rounded-md bg-gray-500/60 px-6 py-2.5 font-semibold transition hover:bg-gray-500/40">
            <InfoIcon /> More Info
          </button>
          <button
            onClick={toggle}
            aria-label={inList ? 'Remove from My List' : 'Add to My List'}
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/60 transition hover:border-white"
          >
            {inList ? <CheckIcon /> : <PlusIcon />}
          </button>
        </div>
      </div>
    </section>
  );
}
