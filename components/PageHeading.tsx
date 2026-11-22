export default function PageHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="pt-3 pb-6">
      <h1 className="font-serif text-ink text-[29px] leading-tight font-bold tracking-tight">
        {title}
      </h1>
      {subtitle ? (
        <p className="text-muted mt-1.5 text-[14px] leading-snug">{subtitle}</p>
      ) : null}
    </div>
  );
}
