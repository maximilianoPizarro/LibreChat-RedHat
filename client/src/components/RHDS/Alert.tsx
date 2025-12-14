/**
 * Red Hat Design System Alert Component
 * 
 * Wrapper for RHDS Alert using React wrappers from @lit-labs/react
 * 
 * @see https://ux.redhat.com/get-started/developers/usage/#using-react-wrappers
 */

import { Alert as RHDSAlert } from '@rhds/elements/react/rh-alert/rh-alert.js';

export interface AlertProps {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

/**
 * Red Hat Design System Alert Component
 * 
 * @example
 * <Alert variant="info" dismissible onDismiss={handleDismiss}>
 *   This is an info alert
 * </Alert>
 */
export default function Alert({
  variant = 'default',
  children,
  className,
  dismissible = false,
  onDismiss,
}: AlertProps) {
  return (
    <RHDSAlert
      variant={variant}
      dismissible={dismissible}
      onDismiss={onDismiss}
      className={className}
    >
      {children}
    </RHDSAlert>
  );
}

