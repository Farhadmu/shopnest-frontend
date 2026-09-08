interface StoreBannerProps {
  banner: string;
  storeName: string;
}

const StoreBanner = ({
  banner,
  storeName,
}: StoreBannerProps) => {
  return (
    <div className="relative h-44 w-full overflow-hidden bg-slate-900 sm:h-56">
      <img
        src={banner}
        alt={storeName}
        className="h-full w-full object-cover opacity-60"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
    </div>
  );
};

export default StoreBanner;