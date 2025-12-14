/**
 * Red Hat Design System Card Component
 * 
 * Wrapper for RHDS Card using React wrappers from @lit-labs/react
 * 
 * @see https://ux.redhat.com/get-started/developers/usage/#using-react-wrappers
 */

import { Card as RHDSCard } from '@rhds/elements/react/rh-card/rh-card.js';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Red Hat Design System Card Component
 * 
 * @example
 * <Card>
 *   <h2 slot="header">Card Title</h2>
 *   <p>Card content</p>
 * </Card>
 */
export default function Card({ children, className }: CardProps) {
  return (
    <RHDSCard className={className}>
      {children}
    </RHDSCard>
  );
}

