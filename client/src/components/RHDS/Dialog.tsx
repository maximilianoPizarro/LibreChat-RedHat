/**
 * Red Hat Design System Dialog Component
 * 
 * Wrapper for RHDS Dialog using React wrappers from @lit-labs/react
 * 
 * @see https://ux.redhat.com/get-started/developers/usage/#using-react-wrappers
 */

import { Dialog as RHDSDialog } from '@rhds/elements/react/rh-dialog/rh-dialog.js';
import { useState, useEffect } from 'react';

export interface DialogProps {
  open?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenChange?: (isOpen: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Red Hat Design System Dialog Component
 * 
 * @example
 * <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
 *   <h2 slot="header">Dialog Title</h2>
 *   <p>Dialog content</p>
 * </Dialog>
 */
export default function Dialog({ 
  open, 
  isOpen: isOpenProp, 
  onClose, 
  onOpenChange,
  children, 
  className 
}: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(open ?? isOpenProp ?? false);
  const isOpen = isOpenProp ?? open ?? internalOpen;

  useEffect(() => {
    if (open !== undefined) {
      setInternalOpen(open);
    } else if (isOpenProp !== undefined) {
      setInternalOpen(isOpenProp);
    }
  }, [open, isOpenProp]);

  const handleClose = () => {
    const newValue = false;
    setInternalOpen(newValue);
    onOpenChange?.(newValue);
    onClose?.();
  };

  return (
    <RHDSDialog
      open={isOpen}
      onClose={handleClose}
      className={className}
    >
      {children}
    </RHDSDialog>
  );
}

