import React from 'react';

interface RedHatLogoProps {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

/**
 * Red Hat Logo Component
 * Red Hat Shadowman logo - classic Red Hat icon
 * Uses the official Shadowman image
 */
export default function RedHatLogo({ className = '', size = 40, style }: RedHatLogoProps) {
  // Logo from local assets - using logo.svg
  const logoSrc = '/assets/logo.svg';
  
  return (
    <img
      src={logoSrc}
      alt="Red Hat Logo"
      className={`redhat-logo ${className}`}
      style={{
        width: size,
        height: size,
        display: 'block',
        objectFit: 'contain',
        imageRendering: 'auto',
        ...style
      }}
    />
  );
}

