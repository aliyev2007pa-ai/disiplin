"use client";

import BottomSheet from "./BottomSheet";
import Simge from "./Simge";

/**
 * Bir kartın "⋯" düğmesine basınca açılan küçük menü.
 *
 * Silme buradan doğrudan yapılmaz: önce bu menü, sonra ConfirmSheet. İki
 * adım, çünkü silme geri alınamıyor ve bu menü yanlışlıkla açılabiliyor.
 */
export default function SecenekSheet({
  acik,
  baslik,
  sabit,
  onDuzenle,
  onSabitle,
  onSil,
  onKapat,
}: {
  acik: boolean;
  baslik: string;
  sabit: boolean;
  onDuzenle: () => void;
  onSabitle: () => void;
  onSil: () => void;
  onKapat: () => void;
}) {
  return (
    <BottomSheet acik={acik} baslik={baslik} onKapat={onKapat}>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onSabitle}
          className="border-bordo-soft bg-surface text-ink hover:border-bordo flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-[15px] font-semibold transition-colors"
        >
          <Simge ad="raptiye" className="text-bordo h-5 w-5 shrink-0" />
          {sabit ? "Sabitlemeyi kaldır" : "En üste sabitle"}
        </button>

        <button
          type="button"
          onClick={onDuzenle}
          className="border-bordo-soft bg-surface text-ink hover:border-bordo flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-[15px] font-semibold transition-colors"
        >
          <Simge ad="kalem" className="text-bordo h-5 w-5 shrink-0" />
          Düzenle
        </button>

        <button
          type="button"
          onClick={onSil}
          className="border-bordo-soft bg-surface text-bordo hover:border-bordo flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-[15px] font-semibold transition-colors"
        >
          <Simge ad="cop" className="h-5 w-5 shrink-0" />
          Sil
        </button>

        <button
          type="button"
          onClick={onKapat}
          className="text-muted hover:bg-surface hover:text-ink mt-1 w-full rounded-xl px-4 py-3.5 text-[15px] font-semibold transition-colors"
        >
          Vazgeç
        </button>
      </div>
    </BottomSheet>
  );
}
