/**
 * Example component demonstrating Red Hat Design System integration
 * 
 * This component shows how to use RHDS Button component.
 * 
 * @see https://ux.redhat.com/get-started/developers/usage/#using-react-wrappers
 */

import Button from './Button';

interface RHDSButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * Example Red Hat Design System Button Component
 * 
 * This component uses the RHDS Button wrapper component.
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
  return (
    <Button
      variant={variant}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

