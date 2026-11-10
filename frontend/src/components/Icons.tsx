type P = { className?: string };

export const PlayIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z" /></svg>
);
export const PlusIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14" /></svg>
);
export const CheckIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 13l4 4L19 7" /></svg>
);
export const InfoIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
);
export const CloseIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const SearchIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
);
export const ChevronIcon = ({ className = 'h-6 w-6', dir = 'right' }: P & { dir?: 'left' | 'right' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <path d={dir === 'right' ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'} />
  </svg>
);
export const StarIcon = ({ className = 'h-4 w-4' }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 7 7 .6-5.3 4.6 1.6 7.1L12 17.5 5.7 21.3l1.6-7.1L2 9.6 9 9z" /></svg>
);

export const Logo = () => (
  <span className="text-2xl font-extrabold tracking-tight">
    <span className="text-brand">Cine</span>Stream
  </span>
);
