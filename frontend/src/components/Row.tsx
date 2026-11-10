import { useRef } from 'react';
import { useFetch, useInView } from '../hooks';
import type { PagedResponse, Title } from '../types';
import { ChevronIcon } from './Icons';
import TitleCard from './TitleCard';

interface Props {
  heading: string;
  load: () => Promise<PagedResponse<Title>>;
  wide?: boolean;
}

/** A horizontally scrolling row. Only fetches once it scrolls near the viewport. */
export default function Row({ heading, load, wide = false }: Props) {
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <section ref={ref} className="mb-8">
      <h2 className="mb-2 px-4 text-lg font-semibold md:px-12 md:text-xl">{heading}</h2>
      {inView ? <RowContent load={load} wide={wide} /> : <RowSkeleton wide={wide} />}
    </section>
  );
}

function RowContent({ load, wide }: { load: Props['load']; wide: boolean }) {
  const { data, loading, error } = useFetch(load, []);
  const scroller = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) =>
    scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.85, behavior: 'smooth' });

  if (loading) return <RowSkeleton wide={wide} />;
  if (error) return <p className="px-4 text-sm text-red-400 md:px-12">{error}</p>;

  const items = (data?.results ?? []).filter((t) => (wide ? t.backdrop_path : t.poster_path));

  return (
    <div className="group/row relative">
      <ArrowButton dir="left" onClick={() => scroll(-1)} />
      <div ref={scroller} className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth px-4 py-3 md:px-12">
        {items.map((t) => <TitleCard key={`${t.id}-${t.media_type ?? ''}`} title={t} wide={wide} />)}
      </div>
      <ArrowButton dir="right" onClick={() => scroll(1)} />
    </div>
  );
}

function ArrowButton({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={`Scroll ${dir}`}
      className={`absolute inset-y-0 z-20 hidden w-12 items-center justify-center bg-black/50 opacity-0 transition hover:bg-black/70 group-hover/row:opacity-100 md:flex ${
        dir === 'left' ? 'left-0' : 'right-0'
      }`}
    >
      <ChevronIcon dir={dir} className="h-8 w-8" />
    </button>
  );
}

function RowSkeleton({ wide }: { wide: boolean }) {
  return (
    <div className="flex gap-2 overflow-hidden px-4 py-3 md:px-12">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={`shrink-0 animate-pulse rounded-md bg-zinc-800 ${wide ? 'aspect-video w-64 md:w-72' : 'aspect-[2/3] w-32 md:w-44'}`} />
      ))}
    </div>
  );
}
