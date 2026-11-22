export default function Alan({
  etiket,
  ipucu,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  etiket: string;
  ipucu?: string;
}) {
  return (
    <label className="block">
      <span className="text-ink block text-[13.5px] font-semibold">
        {etiket}
      </span>
      <input
        {...props}
        className="border-bordo-soft bg-surface text-ink placeholder:text-muted focus:border-bordo mt-1.5 block w-full rounded-xl border px-4 py-3 text-[15px] outline-none transition-colors disabled:opacity-60"
      />
      {ipucu ? (
        <span className="text-muted mt-1.5 block text-[12.5px] leading-snug">
          {ipucu}
        </span>
      ) : null}
    </label>
  );
}
