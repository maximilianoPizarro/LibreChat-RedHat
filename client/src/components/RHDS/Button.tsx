/**
 * Red Hat Design System Button Component
 * 
 * Wrapper for RHDS Button using React wrappers from @lit-labs/react
 * Maps common button variants to RHDS variants
 * 
 * @see https://ux.redhat.com/get-started/developers/usage/#using-react-wrappers
 */

import React from 'react';
import { Button as RHDSButton } from '@rhds/elements/react/rh-button/rh-button.js';
import { cn } from '~/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'default' | 'destructive' | 'outline' | 'ghost' | 'link' | 'submit';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

/**
 * Maps LibreChat button variants to RHDS variants
 */
function mapVariant(variant?: string): 'primary' | 'secondary' | 'tertiary' | 'danger' {
  switch (variant) {
    case 'destructive':
    case 'danger':
      return 'danger';
    case 'secondary':
      return 'secondary';
    case 'outline':
    case 'ghost':
    case 'link':
      return 'tertiary';
    case 'submit':
    case 'default':
    case 'primary':
    default:
      return 'primary';
  }
}

/**
 * Maps LibreChat button sizes to CSS classes
 */
function mapSize(size?: string): string {
  switch (size) {
    case 'sm':
      return 'h-9 px-3 text-sm';
    case 'lg':
      return 'h-11 px-8 text-base';
    case 'icon':
      return 'size-10 p-0';
    default:
      return 'h-10 px-4';
  }
}

/**
 * Red Hat Design System Button Component
 * 
 * Compatible with @librechat/client Button API
 * 
 * @example
 * <Button variant="primary" onClick={handleClick}>
 *   Click Me
 * </Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'default',
  children,
  onClick,
  disabled = false,
  type = 'button',
  className,
  asChild = false,
  ...props
}, ref) => {
  // Map variant to RHDS variant
  const rhdsVariant = mapVariant(variant);
  const sizeClass = mapSize(size);

  // If asChild is true, we can't use RHDS Button directly
  // This is a limitation - asChild requires Slot component
  if (asChild) {
    console.warn('Button: asChild prop is not supported with RHDS Button. Rendering as regular button.');
  }

  return (
    <RHDSButton
      ref={ref}
      variant={rhdsVariant}
      disabled={disabled}
      onClick={onClick}
      type={type}
      className={cn(sizeClass, className)}
      {...props}
    >
      {children}
    </RHDSButton>
  );
});

Button.displayName = 'Button';

export default Button;

