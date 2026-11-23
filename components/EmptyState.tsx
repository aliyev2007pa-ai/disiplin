import Simge from "./Simge";

export default function EmptyState({
  simge,
  title,
  hint,
}: {
  simge: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="border-bordo-soft bg-surface flex flex-col items-center rounded-2xl border px-6 py-12 text-center">
      <span className="border-bordo-soft bg-bg text-bordo flex h-14 w-14 items-center justify-center rounded-2xl border">
        <Simge ad={simge} className="h-7 w-7" />
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
