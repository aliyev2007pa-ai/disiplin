export default function GonderButonu({
  bekliyor,
  children,
}: {
  bekliyor: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={bekliyor}
      className="bg-bordo hover:bg-bordo-dark w-full rounded-xl px-4 py-3.5 text-[15px] font-semibold text-white transition-colors disabled:opacity-60"
    >
      {bekliyor ? "Lütfen bekle…" : children}
    </button>
  );
}
