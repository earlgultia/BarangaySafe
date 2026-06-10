export function BrandLogo({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="brandGradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#0f4c81" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="64" height="64" rx="14" fill="url(#brandGradient)" />
      <path d="M12 44c3-5 7-8 12-8 5.5 0 6.5 5 12 5 5.5 0 7.5-5 12-5 4.5 0 7.5 2.5 10 6v7H12v-5Z" fill="#fff" opacity="0.95" />
      <path d="M16 48.5c5-5 9-5 13-5 5 0 7 5 12 5 5 0 7-5 12-5 4 0 6 3 7 5" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <path d="M24 54c3-4 6-5 9-5 5 0 7 4 12 4 4 0 6-3 8-4" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      <path d="M18 26c-1.5-2.8-0.9-6.2 1.5-8.2 2.4-2.1 5.8-2.4 8.6-1 0.8-2.3 3.2-4 5.9-4 3.4 0 6.2 2.8 6.2 6.2 0 0.2 0 0.4-0.1 0.5 1.8 0.3 3.1 2 3.1 3.9 0 2.1-1.7 3.8-3.8 3.8H18Z" fill="#e2e8f0" />
      <path d="M25 18 20 30h5l-3 9 10-11h-5l4-13z" fill="#fde68a" stroke="#f59e0b" strokeWidth="1" strokeLinejoin="round" />
      <path d="M30 18c0-1.4-1.1-2.5-2.5-2.5S25 16.6 25 18s1.1 2.5 2.5 2.5S30 19.4 30 18Z" fill="#0f172a" />
    </svg>
  )
}

export default BrandLogo;
