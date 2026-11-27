import { CakeSlice } from 'lucide-react';
import { useState } from 'react';

export function BrandLogoIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="18" fill="#F36B21" />
      <path
        d="M20 20 L6 20 A14 14 0 0 1 20 6 Z"
        fill="#FFFFFF"
        opacity="0.92"
      />
      <path
        d="M20 20 L8.5 20 A11.5 11.5 0 0 1 20 8.5 Z"
        fill="#F36B21"
      />
      <path
        d="M7 20.5 H20.5 L12.5 31.5"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function VegMark({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="100% Pure Vegetarian"
    >
      <rect
        x="1"
        y="1"
        width="16"
        height="16"
        rx="2.5"
        stroke="#1F7A3E"
        strokeWidth="1.5"
        fill="#FFFFFF"
      />
      <circle cx="9" cy="9" r="4" fill="#1F7A3E" />
    </svg>
  );
}

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export function SafeImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  loading = 'lazy',
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF9F1] via-[#F8F0E5] to-[#EEE7DF] text-[#81766D] p-6 text-center"
        role="img"
        aria-label={alt}
      >
        <CakeSlice className="w-8 h-8 text-[#F36B21]/70 mb-2" strokeWidth={1.5} />
        <span className="text-xs font-medium tracking-wide text-[#28231F]/80 line-clamp-2">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
