import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Title } from '../types';
import DetailModal from './DetailModal';

interface Ctx {
  open: (t: Title, autoplay?: boolean) => void;
}

const DetailModalCtx = createContext<Ctx>({ open: () => {} });

export function DetailModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ title: Title; autoplay: boolean } | null>(null);

  return (
    <DetailModalCtx.Provider value={{ open: (title, autoplay = false) => setState({ title, autoplay }) }}>
      {children}
      {state && (
        <DetailModal
          key={`${state.title.id}-${state.autoplay}`}
          title={state.title}
          autoplay={state.autoplay}
          onClose={() => setState(null)}
          onOpenSimilar={(t) => setState({ title: t, autoplay: false })}
        />
      )}
    </DetailModalCtx.Provider>
  );
}

export const useDetailModal = () => useContext(DetailModalCtx);
