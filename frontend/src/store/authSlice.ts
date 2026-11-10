import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi, errorMessage, tokenStorage } from '../api/client';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'ready';
  error: string | null;
}

const initialState: AuthState = { user: null, status: 'idle', error: null };

export const login = createAsyncThunk(
  'auth/login',
  async (p: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authApi.login(p.email, p.password);
      tokenStorage.set(res.token);
      return res.user;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (p: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authApi.register(p.name, p.email, p.password);
      tokenStorage.set(res.token);
      return res.user;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  },
);

/** Restore session on page load if a token exists. */
export const restoreSession = createAsyncThunk('auth/restore', async () => {
  if (!tokenStorage.get()) return null;
  try {
    return await authApi.me();
  } catch {
    tokenStorage.clear();
    return null;
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      tokenStorage.clear();
      state.user = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(restoreSession.pending, (s) => { s.status = 'loading'; })
     .addCase(restoreSession.fulfilled, (s, a) => { s.user = a.payload; s.status = 'ready'; });

    for (const thunk of [login, register]) {
      b.addCase(thunk.pending, (s) => { s.status = 'loading'; s.error = null; })
       .addCase(thunk.fulfilled, (s, a) => { s.user = a.payload; s.status = 'ready'; })
       .addCase(thunk.rejected, (s, a) => { s.status = 'ready'; s.error = a.payload as string; });
    }
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
