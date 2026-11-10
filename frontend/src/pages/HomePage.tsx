import Hero from '../components/Hero';
import Row from '../components/Row';
import { movieApi } from '../api/client';

const rows = [
  { heading: 'Trending Now', load: () => movieApi.category('trending') },
  { heading: 'Streaming Originals', load: () => movieApi.category('originals'), wide: true },
  { heading: 'Top Rated', load: () => movieApi.category('top_rated') },
  { heading: 'Currently Airing', load: () => movieApi.category('now_playing') },
  { heading: 'Crime', load: () => movieApi.byGenre('Crime') },
  { heading: 'Comedy', load: () => movieApi.byGenre('Comedy') },
  { heading: 'Action', load: () => movieApi.byGenre('Action') },
  { heading: 'Sci-Fi', load: () => movieApi.byGenre('Science-Fiction') },
  { heading: 'Romance', load: () => movieApi.byGenre('Romance') },
  { heading: 'New & Recent', load: () => movieApi.category('upcoming'), wide: true },
];

export default function HomePage() {
  return (
    <>
      <Hero load={() => movieApi.category('trending')} />
      <div className="relative z-10 -mt-24">
        {rows.map((r) => <Row key={r.heading} {...r} />)}
      </div>
    </>
  );
}
