/**
 * Sayfalar sunucuda oluşturulurken anında görünen iskelet.
 *
 * Bu dosya olmadan Next.js, sunucu cevap verene kadar ekranda eski sayfayı
 * tutar; sekmeye basınca "donuyor" hissi bundan doğar. İskeletin biçimi
 * gerçek içeriğe benzer (başlık + halka + kartlar), böylece içerik gelince
 * sayfa zıplamaz.
 */

function KartIskeleti() {
  return (
    <div className="border-bordo-soft bg-surface flex items-center gap-3 rounded-2xl border py-3.5 pr-3 pl-4">
      <div className="bg-bordo-soft h-7 w-7 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <div className="bg-bordo-soft h-3.5 w-2/3 rounded" />
        <div className="bg-bordo-soft/70 mt-2 h-2.5 w-1/3 rounded" />
      </div>
      <div className="bg-bordo-soft h-10 w-10 shrink-0 rounded-full" />
    </div>
  );
}

export default function Loading() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="flex items-center justify-between gap-4 pt-3 pb-6">
        <div className="min-w-0 flex-1">
          <div className="bg-surface h-7 w-44 rounded-lg" />
          <div className="bg-surface mt-2.5 h-3.5 w-32 rounded" />
        </div>
        <div className="border-bordo-soft h-14 w-14 shrink-0 rounded-full border-[5px]" />
      </div>

      <div className="flex flex-col gap-2.5">
        <KartIskeleti />
        <KartIskeleti />
        <KartIskeleti />
      </div>

      <span className="sr-only">Yükleniyor…</span>
    </div>
  );
}
