/**
 * Example component demonstrating Red Hat Design System integration
 * 
 * This component shows how to use RHDS web components in React.
 * For production use, consider creating wrapper components.
 */

import { useEffect, useRef } from 'react';
import { loadRHDSElement } from '~/utils/rhds';

interface RHDSButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * Example Red Hat Design System Button Component
 * 
 * This is a React wrapper around the RHDS <rh-button> web component.
 * 
 * @example
 * <RHDSButton variant="primary" onClick={handleClick}>
 *   Click Me
 * </RHDSButton>
 */
export default function RHDSButton({
  variant = 'primary',
  children,
  onClick,
  disabled = false,
}: RHDSButtonProps) {
  const buttonRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Load the RHDS button element
    loadRHDSElement('rh-button').then(() => {
      // Element is now available
      if (buttonRef.current) {
        const button = buttonRef.current as any;
        if (onClick) {
          button.addEventListener('click', onClick);
        }
        return () => {
          if (onClick) {
            button.removeEventListener('click', onClick);
          }
        };
      }
    });
  }, [onClick]);

  return (
    <rh-button
      ref={buttonRef}
      variant={variant}
      disabled={disabled}
    >
      {children}
    </rh-button>
  );
}

