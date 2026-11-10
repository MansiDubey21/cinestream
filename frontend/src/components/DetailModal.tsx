import { useEffect, useState } from 'react';
import { IMG, mediaTypeOf, movieApi, titleOf, yearOf } from '../api/client';
import { useFetch, useMyList } from '../hooks';
import type { Title } from '../types';
import { CheckIcon, CloseIcon, PlayIcon, PlusIcon, StarIcon } from './Icons';

interface Props {
  title: Title;
  autoplay: boolean;
  onClose: () => void;
  onOpenSimilar: (t: Title) => void;
}

export default function DetailModal({ title, autoplay, onClose, onOpenSimilar }: Props) {
  const type = mediaTypeOf(title);
  const { data: details, loading } = useFetch(() => movieApi.details(type, title.id), [type, title.id]);
  const [playing, setPlaying] = useState(autoplay);
  const { inList, toggle } = useMyList(title);

  // Close on Escape + lock background scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const videos = details?.videos?.results ?? [];
  const trailer =
    videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ??
    videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
    videos.find((v) => v.site === 'YouTube');

  const runtime = details?.runtime
    ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
    : details?.number_of_seasons
      ? `${details.number_of_seasons} Season${details.number_of_seasons > 1 ? 's' : ''}`
      : '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-2 backdrop-blur-sm md:p-8" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titleOf(title)}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-xl bg-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 rounded-full bg-black/70 p-2 hover:bg-black">
          <CloseIcon />
        </button>

        {/* Media area: trailer or backdrop */}
        <div className="relative aspect-video w-full bg-black">
          {playing && trailer ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
              title={`${titleOf(title)} trailer`}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              {title.backdrop_path && (
                <img src={IMG.backdrop(title.backdrop_path)} alt="" className="h-full w-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="mb-4 text-3xl font-extrabold md:text-4xl">{titleOf(title)}</h2>
                <div className="flex gap-3">
                  {trailer || loading ? (
                    <button
                      disabled={loading}
                      onClick={() => setPlaying(true)}
                      className="flex items-center gap-2 rounded-md bg-white px-6 py-2 font-semibold text-black transition hover:bg-white/80 disabled:opacity-50"
                    >
                      <PlayIcon /> {loading ? 'Loading…' : 'Play Trailer'}
                    </button>
                  ) : (
                    // No embedded trailer from the data provider -> open a YouTube search instead
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${titleOf(title)} ${yearOf(title)} trailer`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-md bg-white px-6 py-2 font-semibold text-black transition hover:bg-white/80"
                    >
                      <PlayIcon /> Watch Trailer
                    </a>
                  )}
                  <button
                    onClick={toggle}
                    aria-label={inList ? 'Remove from My List' : 'Add to My List'}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/60 transition hover:border-white"
                  >
                    {inList ? <CheckIcon /> : <PlusIcon />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="grid gap-6 p-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
              {title.vote_average > 0 && (
                <span className="flex items-center gap-1 font-semibold text-yellow-400">
                  <StarIcon /> {title.vote_average.toFixed(1)}
                </span>
              )}
              {yearOf(title) && <span className="text-gray-300">{yearOf(title)}</span>}
              {runtime && <span className="text-gray-300">{runtime}</span>}
              <span className="rounded border border-gray-500 px-1.5 text-xs uppercase text-gray-300">{type}</span>
            </div>
            {details?.tagline && <p className="mb-2 italic text-gray-400">{details.tagline}</p>}
            <p className="leading-relaxed text-gray-200">{details?.overview || title.overview}</p>
          </div>
          <div className="space-y-2 text-sm">
            {details?.credits?.cast?.length ? (
              <p><span className="text-gray-500">Cast: </span>{details.credits.cast.slice(0, 5).map((c) => c.name).join(', ')}</p>
            ) : null}
            {details?.genres?.length ? (
              <p><span className="text-gray-500">Genres: </span>{details.genres.map((g) => g.name).join(', ')}</p>
            ) : null}
          </div>
        </div>

        {/* More like this */}
        {details?.similar?.results?.length ? (
          <div className="px-6 pb-8">
            <h3 className="mb-4 text-xl font-semibold">More Like This</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {details.similar.results
                .filter((s) => s.backdrop_path)
                .slice(0, 8)
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onOpenSimilar({ ...s, media_type: type })}
                    className="overflow-hidden rounded-md bg-zinc-800 text-left transition hover:ring-2 hover:ring-brand"
                  >
                    <img src={IMG.backdrop(s.backdrop_path, 'w300')} alt="" loading="lazy" className="aspect-video w-full object-cover" />
                    <p className="truncate p-2 text-sm">{titleOf(s)}</p>
                  </button>
                ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
