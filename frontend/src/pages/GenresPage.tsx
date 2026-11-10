import Hero from '../components/Hero';
import Row from '../components/Row';
import { movieApi } from '../api/client';
import { useFetch } from '../hooks';

/** Genres page: one row per genre (genre list comes from the API, cached for 24h). */
export default function GenresPage() {
  const { data: genres } = useFetch(() => movieApi.genres(), []);

  return (
    <>
      <Hero load={() => movieApi.category('popular')} />
      <div className="relative z-10 -mt-24">
        <Row heading="Popular Right Now" load={() => movieApi.category('popular')} />
        {genres?.map((g) => (
          <Row key={g.id} heading={g.name} load={() => movieApi.byGenre(g.name)} />
        ))}
      </div>
    </>
  );
}
