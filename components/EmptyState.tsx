export default function EmptyState({
  emoji,
  title,
  hint,
}: {
  emoji: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="border-bordo-soft bg-surface flex flex-col items-center rounded-2xl border px-6 py-12 text-center">
      <span className="text-[34px] leading-none" aria-hidden>
        {emoji}
      </span>
      <p className="font-serif text-ink mt-4 text-[17px] font-semibold">{title}</p>
      {hint ? (
        <p className="text-muted mt-1.5 max-w-[16rem] text-[13.5px] leading-relaxed">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
