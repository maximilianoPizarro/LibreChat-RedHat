import React from 'react';

interface RedHatLogoProps {
  className?: string;
  size?: number;
}

/**
 * Red Hat Logo Component
 * Official Red Hat logo - sombrero rojo
 */
export default function RedHatLogo({ className = '', size = 40 }: RedHatLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Red Hat Logo"
      role="img"
    >
      {/* Red Hat sombrero logo - simplified version */}
      <path
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        fill="#EE0000"
        stroke="#EE0000"
        strokeWidth="0.5"
      />
    </svg>
  );
}

