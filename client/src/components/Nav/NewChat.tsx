import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys, Constants } from 'librechat-data-provider';
import { Button } from '~/components/RHDS';
import { TooltipAnchor, NewChatIcon, MobileSidebar, Sidebar } from '@librechat/client';
import type { TMessage } from 'librechat-data-provider';
import { useLocalize, useNewConvo } from '~/hooks';
import { clearMessagesCache } from '~/utils';
import store from '~/store';
import RedHatLogo from '~/components/RedHatLogo';

export default function NewChat({
  index = 0,
  toggleNav,
  subHeaders,
  isSmallScreen,
  headerButtons,
}: {
  index?: number;
  toggleNav: () => void;
  isSmallScreen?: boolean;
  subHeaders?: React.ReactNode;
  headerButtons?: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  /** Note: this component needs an explicit index passed if using more than one */
  const { newConversation: newConvo } = useNewConvo(index);
  const navigate = useNavigate();
  const localize = useLocalize();
  const { conversation } = store.useCreateConversationAtom(index);

  const clickHandler: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      if (e.button === 0 && (e.ctrlKey || e.metaKey)) {
        window.open('/c/new', '_blank');
        return;
      }
      clearMessagesCache(queryClient, conversation?.conversationId);
      queryClient.invalidateQueries([QueryKeys.messages]);
      newConvo();
      navigate('/c/new', { state: { focusChat: true } });
      if (isSmallScreen) {
        toggleNav();
      }
    },
    [queryClient, conversation, newConvo, navigate, toggleNav, isSmallScreen],
  );

  // Force red color on navigation buttons using shadow DOM access
  useEffect(() => {
    const forceRedButtons = () => {
      const buttons = document.querySelectorAll('#chat-history-nav rh-button[data-testid="close-sidebar-button"], #chat-history-nav rh-button[data-testid="nav-new-chat-button"]');
      buttons.forEach((button: any) => {
        if (button) {
          // Set CSS variables
          button.style.setProperty('--rh-button-tertiary-hover-background-color', 'rgba(238, 0, 0, 0.1)', 'important');
          button.style.setProperty('--rh-button-tertiary-hover-color', '#EE0000', 'important');
          button.style.setProperty('--rh-button-tertiary-focus-ring-color', '#EE0000', 'important');
          
          // Access shadow DOM and force red color on hover
          if (button.shadowRoot) {
            const base = button.shadowRoot.querySelector('[part="base"]') || button.shadowRoot.querySelector('button');
            if (base) {
              // Set initial styles
              base.style.setProperty('width', '32px', 'important');
              base.style.setProperty('height', '32px', 'important');
              base.style.setProperty('min-width', '32px', 'important');
              base.style.setProperty('min-height', '32px', 'important');
              base.style.setProperty('padding', '0.375rem', 'important');
              
              // Add hover listener
              base.addEventListener('mouseenter', () => {
                base.style.setProperty('background-color', 'rgba(238, 0, 0, 0.1)', 'important');
                base.style.setProperty('color', '#EE0000', 'important');
                base.style.setProperty('border-color', 'rgba(238, 0, 0, 0.3)', 'important');
              });
              
              base.addEventListener('mouseleave', () => {
                base.style.setProperty('background-color', 'transparent', 'important');
                base.style.setProperty('color', '', 'important');
                base.style.setProperty('border-color', 'transparent', 'important');
              });
            }
          }
        }
      });
    };
    
    // Try multiple times to ensure shadow DOM is ready
    forceRedButtons();
    const timeout1 = setTimeout(forceRedButtons, 50);
    const timeout2 = setTimeout(forceRedButtons, 200);
    const timeout3 = setTimeout(forceRedButtons, 500);
    
    // Also use MutationObserver to catch when buttons are added to DOM
    const observer = new MutationObserver(() => {
      forceRedButtons();
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div className="flex items-center justify-between py-[2px] md:py-2 px-2">
        <div className="flex items-center gap-2">
          {/* Red Hat Logo */}
          <div className="flex items-center justify-center">
            <RedHatLogo size={32} className="opacity-100" />
          </div>
          <TooltipAnchor
            description={localize('com_nav_close_sidebar')}
            render={
              <Button
                size="icon"
                variant="tertiary"
                data-testid="close-sidebar-button"
                aria-label={localize('com_nav_close_sidebar')}
                className="!h-8 !w-8 !min-h-8 !min-w-8 rounded-lg border-none bg-transparent p-1.5 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring-primary nav-button-red"
                onClick={toggleNav}
              >
                <Sidebar className="max-md:hidden h-4 w-4" />
                <MobileSidebar className="m-1 inline-flex size-6 items-center justify-center md:hidden" />
              </Button>
            }
          />
        </div>
        <div className="flex gap-0.5">
          {headerButtons}

          <TooltipAnchor
            description={localize('com_ui_new_chat')}
            render={
              <Button
                size="icon"
                variant="tertiary"
                data-testid="nav-new-chat-button"
                aria-label={localize('com_ui_new_chat')}
                className="!h-8 !w-8 !min-h-8 !min-w-8 rounded-lg border-none bg-transparent p-1.5 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring-primary nav-button-red"
                onClick={clickHandler}
              >
                <NewChatIcon className="icon-md text-text-primary" />
              </Button>
            }
          />
        </div>
      </div>
      {subHeaders != null ? subHeaders : null}
    </>
  );
}
