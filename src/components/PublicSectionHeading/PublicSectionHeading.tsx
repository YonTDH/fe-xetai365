type PublicSectionHeadingProps = {
  title: string;
  className?: string;
};

export function PublicSectionHeading({ title, className = '' }: PublicSectionHeadingProps) {
  return (
    <div className={`mb-8 flex border-b-2 border-navy-950 ${className}`.trim()}>
      <h1
        className="relative -mb-0.5 bg-navy-950 px-5 py-2 pr-11 text-[15px] font-bold uppercase tracking-[0.08em] text-white md:px-6 md:py-3 md:pr-12 md:text-[18px]"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%)',
        }}
      >
        {title}
      </h1>
    </div>
  );
}
