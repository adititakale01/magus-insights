import { ReactNode, HTMLAttributes } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = true, ...props }: GlassCardProps) {
  return (
    <div
      className={`
        backdrop-blur-lg bg-white/10 rounded-xl border border-white/20
        shadow-lg shadow-black/20
        ${hover ? 'transition-all duration-300 hover:bg-white/15 hover:shadow-cyan-500/20 hover:shadow-xl hover:-translate-y-1' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
