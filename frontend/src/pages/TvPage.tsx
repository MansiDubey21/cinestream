import Hero from '../components/Hero';
import Row from '../components/Row';
import { movieApi } from '../api/client';

export default function TvPage() {
  return (
    <>
      <Hero load={() => movieApi.category('popular_tv')} />
      <div className="relative z-10 -mt-24">
        <Row heading="Popular TV Shows" load={() => movieApi.category('popular_tv')} />
        <Row heading="Originals" load={() => movieApi.category('originals')} wide />
        <Row heading="More to Binge" load={() => movieApi.category('popular_tv', 2)} />
        <Row heading="Hidden Gems" load={() => movieApi.category('originals', 2)} wide />
      </div>
    </>
  );
}
