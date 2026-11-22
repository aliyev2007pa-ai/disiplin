/**
 * Sayfalar sunucuda oluşturulurken anında görünen iskelet.
 *
 * Bu dosya olmadan Next.js, sunucu cevap verene kadar ekranda eski sayfayı
 * tutar; sekmeye basınca "donuyor" hissi bundan doğar. Buradaki iskelet
 * sayesinde geçiş anında olur, içerik arkadan akar.
 */
export default function Loading() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="pt-3 pb-6">
        <div className="bg-surface h-8 w-40 rounded-lg" />
        <div className="bg-surface mt-3 h-4 w-64 rounded" />
      </div>

      <div className="border-bordo-soft bg-surface flex flex-col items-center rounded-2xl border px-6 py-12">
        <div className="bg-bordo-soft h-9 w-9 rounded-full" />
        <div className="bg-bordo-soft mt-4 h-4 w-36 rounded" />
        <div className="bg-bordo-soft mt-3 h-3 w-52 rounded" />
      </div>

      <span className="sr-only">Yükleniyor…</span>
    </div>
  );
}
