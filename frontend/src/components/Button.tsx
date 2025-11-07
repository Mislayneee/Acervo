import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
  children: React.ReactNode;
};

export default function Button({ variant='primary', children, className='', ...rest }: Props){
  const base = `
    inline-flex items-center justify-center gap-2
    px-4 py-2 rounded-[12px] border transition-all
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;
  const styles = variant === 'primary'
    ? `bg-[var(--color-primary)] text-white border-transparent hover:bg-[var(--color-primary-600)] focus:ring-[var(--color-primary)]`
    : `bg-transparent text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary-50)] focus:ring-[var(--color-primary)]`;

  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
}
