// ParkHex logo: teal hexagon with a "P" + two-colour wordmark
export default function Logo({ size = 36, dark = false, showText = true }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M32 3 56 17v30L32 61 8 47V17Z"
          fill="#14B8A6"
          stroke="#14B8A6"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M24 17h13a10 10 0 0 1 0 20h-5v10h-8Zm8 7v6h4.5a3 3 0 0 0 0-6Z"
          fill="#fff"
          fillRule="evenodd"
        />
      </svg>
      {showText && (
        <span className="text-2xl font-bold tracking-tight">
          <span className={dark ? 'text-white' : 'text-primary'}>Park</span>
          <span className="text-accent">Hex</span>
        </span>
      )}
    </div>
  );
}
