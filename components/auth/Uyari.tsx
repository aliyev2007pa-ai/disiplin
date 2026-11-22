export default function Uyari({
  tur,
  children,
}: {
  tur: "hata" | "bilgi";
  children: React.ReactNode;
}) {
  const hata = tur === "hata";

  return (
    <p
      role={hata ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-[13.5px] leading-snug ${
        hata
          ? "border-bordo-soft bg-bordo-soft text-bordo-dark"
          : "border-success-soft bg-success-soft text-success"
      }`}
    >
      {children}
    </p>
  );
}
