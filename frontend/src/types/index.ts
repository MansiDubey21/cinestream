export type MediaType = 'movie' | 'tv';

/** A movie or TV show as returned by the backend list endpoints. */
export interface Title {
  id: number;
  title?: string; // movies
  name?: string; // tv
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: MediaType | 'person';
  genre_ids?: number[];
}

export interface PagedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Video {
  key: string;
  site: string;
  type: string;
  official: boolean;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
}

export interface TitleDetails extends Title {
  runtime?: number;
  number_of_seasons?: number;
  genres: { id: number; name: string }[];
  tagline?: string;
  videos?: { results: Video[] };
  credits?: { cast: CastMember[] };
  similar?: PagedResponse<Title>;
}

export interface Genre {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface WatchlistItem {
  titleId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number | null;
  addedAt: string;
}
