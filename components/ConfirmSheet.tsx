"use client";

import BottomSheet from "./BottomSheet";

/** Geri alınamayan işlemler için onay paneli. */
export default function ConfirmSheet({
  acik,
  baslik,
  mesaj,
  onayMetni = "Sil",
  onOnayla,
  onKapat,
}: {
  acik: boolean;
  baslik: string;
  mesaj: string;
  onayMetni?: string;
  onOnayla: () => void;
  onKapat: () => void;
}) {
  return (
    <BottomSheet acik={acik} baslik={baslik} onKapat={onKapat}>
      <p className="text-muted text-[14.5px] leading-relaxed">{mesaj}</p>

      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            onOnayla();
            onKapat();
          }}
          className="bg-bordo hover:bg-bordo-dark w-full rounded-xl px-4 py-3.5 text-[15px] font-semibold text-white transition-colors"
        >
          {onayMetni}
        </button>

        <button
          type="button"
          onClick={onKapat}
          className="text-muted hover:bg-surface hover:text-ink w-full rounded-xl px-4 py-3.5 text-[15px] font-semibold transition-colors"
        >
          Vazgeç
        </button>
      </div>
    </BottomSheet>
  );
}
