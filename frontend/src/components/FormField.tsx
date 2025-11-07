import React from 'react';

type Props = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

export default function FormField({ label, error, children }: Props) {
  return (
    <label className="block" style={{marginBottom:'16px'}}>
      <div className="muted" style={{marginBottom:6, fontWeight:500}}>{label}</div>
      {children}
      {error ? <div style={{color:'#b91c1c', marginTop:6, fontSize:12}}>{error}</div> : null}
    </label>
  );
}
