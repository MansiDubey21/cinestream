import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { watchlistApi } from '../api/client';
import type { MediaType, WatchlistItem } from '../types';
import { logout } from './authSlice';

interface WatchlistState {
  items: WatchlistItem[];
  loaded: boolean;
  fetching: boolean;
}

const initialState: WatchlistState = { items: [], loaded: false, fetching: false };

export const fetchWatchlist = createAsyncThunk(
  'watchlist/fetch',
  () => watchlistApi.list(),
  {
    // Many components ask for the list on mount; only allow one request in flight
    condition: (_, { getState }) => !(getState() as { watchlist: WatchlistState }).watchlist.fetching,
  },
);

export const addToWatchlist = createAsyncThunk(
  'watchlist/add',
  (item: Omit<WatchlistItem, 'addedAt'>) => watchlistApi.add(item),
);

export const removeFromWatchlist = createAsyncThunk(
  'watchlist/remove',
  async (p: { mediaType: MediaType; titleId: number }) => {
    await watchlistApi.remove(p.mediaType, p.titleId);
    return p;
  },
);

const same = (a: { mediaType: MediaType; titleId: number }, b: { mediaType: MediaType; titleId: number }) =>
  a.mediaType === b.mediaType && a.titleId === b.titleId;

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchWatchlist.pending, (s) => { s.fetching = true; })
      .addCase(fetchWatchlist.fulfilled, (s, a) => { s.items = a.payload; s.loaded = true; s.fetching = false; })
      .addCase(fetchWatchlist.rejected, (s) => { s.loaded = true; s.fetching = false; })
      // Optimistic add: show it immediately, roll back if the API fails
      .addCase(addToWatchlist.pending, (s, a) => {
        if (!s.items.some((i) => same(i, a.meta.arg))) {
          s.items.unshift({ ...a.meta.arg, addedAt: new Date().toISOString() });
        }
      })
      .addCase(addToWatchlist.rejected, (s, a) => {
        s.items = s.items.filter((i) => !same(i, a.meta.arg));
      })
      // Optimistic remove
      .addCase(removeFromWatchlist.pending, (s, a) => {
        s.items = s.items.filter((i) => !same(i, a.meta.arg));
      })
      // removeFromWatchlist.rejected -> useMyList() refetches to resync
      .addCase(logout, () => initialState);
  },
});

export default watchlistSlice.reducer;
