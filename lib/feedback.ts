/**
 * Tik geri bildirimi: kısa bir ses ve titreşim.
 *
 * Ses dosyası kullanılmaz; ton Web Audio API ile anlık üretilir. Böylece
 * indirilecek bir varlık yok, gecikme yok.
 */

import { yerelYaz } from "./yerel";

export const SES_ANAHTARI = "disiplin:ses";

/** Tik sesi açık mı? Varsayılan açıktır. */
export function sesAcikMi(): boolean {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(SES_ANAHTARI) !== "0";
  } catch {
    // Gizli sekmede veya site verileri engellenmişse okuma hata verebilir.
    return true;
  }
}

/** Tik sesini açar veya kapatır. */
export function sesiAyarla(acik: boolean): void {
  // yerelYaz hem yazar hem de ayarı dinleyen bileşenleri uyandırır.
  yerelYaz(SES_ANAHTARI, acik ? "1" : "0");
}

let sesBaglami: AudioContext | null = null;

function baglamAl(): AudioContext | null {
  if (typeof window === "undefined") return null;

  try {
    // iOS, AudioContext'in bir kullanıcı hareketi içinde oluşturulmasını
    // ister; bu fonksiyon yalnızca tıklama sırasında çağrılır.
    sesBaglami ??= new AudioContext();

    if (sesBaglami.state === "suspended") {
      void sesBaglami.resume();
    }

    return sesBaglami;
  } catch {
    return null;
  }
}

/**
 * Yumuşak bir "tık/ding".
 *
 * İki kısa sinüs tonu: biri yükselen, biri üstüne binen hafif bir beşli.
 * Ses seviyesi bilerek düşük; bildirim değil, onay hissi vermeli.
 */
export function tikSesi(): void {
  if (!sesAcikMi()) return;

  const ctx = baglamAl();
  if (!ctx) return;

  const simdi = ctx.currentTime;
  const ana = ctx.createGain();
  ana.gain.value = 0.12;
  ana.connect(ctx.destination);

  for (const [frekans, gecikme, sure] of [
    [880, 0, 0.18],
    [1320, 0.045, 0.16],
  ] as const) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frekans, simdi + gecikme);

    gain.gain.setValueAtTime(0.0001, simdi + gecikme);
    gain.gain.exponentialRampToValueAtTime(1, simdi + gecikme + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, simdi + gecikme + sure);

    osc.connect(gain);
    gain.connect(ana);

    osc.start(simdi + gecikme);
    osc.stop(simdi + gecikme + sure + 0.02);
  }
}

/** Telefonlarda kısa titreşim. Desteklemeyen cihazlarda sessizce geçer. */
export function titret(ms = 25): void {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // Bazı tarayıcılar kullanıcı etkileşimi dışında hata atar.
  }
}
