import { IMG, titleOf } from '../api/client';
import type { Title } from '../types';
import { useDetailModal } from './DetailModalContext';
import { StarIcon } from './Icons';

export default function TitleCard({ title, wide = false }: { title: Title; wide?: boolean }) {
  const { open } = useDetailModal();
  const img = wide ? IMG.backdrop(title.backdrop_path, 'w500') : IMG.poster(title.poster_path);

  return (
    <button
      onClick={() => open(title)}
      className={`group relative shrink-0 overflow-hidden rounded-md bg-zinc-800 text-left transition duration-300 hover:z-10 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand ${
        wide ? 'aspect-video w-64 md:w-72' : 'aspect-[2/3] w-32 md:w-44'
      }`}
    >
      {img ? (
        <img src={img} alt={titleOf(title)} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center p-2 text-center text-sm text-gray-400">{titleOf(title)}</div>
      )}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
        <p className="line-clamp-2 text-sm font-semibold">{titleOf(title)}</p>
        {title.vote_average > 0 && (
          <p className="flex items-center gap-1 text-xs text-yellow-400">
            <StarIcon className="h-3 w-3" /> {title.vote_average.toFixed(1)}
          </p>
        )}
      </div>
    </button>
  );
}
