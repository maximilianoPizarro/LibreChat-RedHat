/**
 * Red Hat Design System Tabs Component
 * 
 * Wrapper for RHDS Tabs using React wrappers from @lit-labs/react
 * 
 * @see https://ux.redhat.com/get-started/developers/usage/#using-react-wrappers
 */

import { Tabs as RHDSTabs } from '@rhds/elements/react/rh-tabs/rh-tabs.js';

export interface TabsProps {
  children: React.ReactNode;
  selected?: number;
  onSelectedChange?: (selected: number) => void;
  className?: string;
}

/**
 * Red Hat Design System Tabs Component
 * 
 * @example
 * <Tabs selected={0} onSelectedChange={(index) => setSelected(index)}>
 *   <rh-tab slot="tab">Tab 1</rh-tab>
 *   <rh-tab-panel>Panel 1</rh-tab-panel>
 * </Tabs>
 */
export default function Tabs({ children, selected, onSelectedChange, className }: TabsProps) {
  return (
    <RHDSTabs
      selected={selected}
      onSelectedChange={onSelectedChange}
      className={className}
    >
      {children}
    </RHDSTabs>
  );
}

