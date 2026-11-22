import Link from "next/link";

export default function AuthShell({
  baslik,
  altBaslik,
  children,
  altLinkMetni,
  altLinkYazisi,
  altLinkHref,
}: {
  baslik: string;
  altBaslik: string;
  children: React.ReactNode;
  altLinkMetni?: string;
  altLinkYazisi?: string;
  altLinkHref?: string;
}) {
  return (
    <main className="flex min-h-full flex-1 flex-col justify-center px-5 py-10">
      <div className="mx-auto w-full max-w-[26rem]">
        <div className="flex flex-col items-center text-center">
          <span
            className="bg-bordo font-serif flex h-14 w-14 items-center justify-center rounded-2xl text-[30px] leading-none font-bold text-white"
            aria-hidden
          >
            D
          </span>
          <h1 className="font-serif text-ink mt-5 text-[30px] leading-tight font-bold tracking-tight">
            {baslik}
          </h1>
          <p className="text-muted mt-2 text-[14px] leading-snug">{altBaslik}</p>
        </div>

        <div className="mt-8">{children}</div>

        {altLinkMetni && altLinkHref && altLinkYazisi ? (
          <p className="text-muted mt-6 text-center text-[13.5px]">
            {altLinkMetni}{" "}
            <Link
              href={altLinkHref}
              className="text-bordo font-semibold underline underline-offset-2"
            >
              {altLinkYazisi}
            </Link>
          </p>
        ) : null}
      </div>
    </main>
  );
}
