import type React from 'react';

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      {children}
    </label>
  );
}

export function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-lg border px-3 py-1.5 text-sm font-semibold transition',
        active
          ? 'border-[#135a91] bg-[#135a91] text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

