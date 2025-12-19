import React, { memo, useState } from 'react';
import { UserIcon, useAvatar } from '@librechat/client';
import type { TUser } from 'librechat-data-provider';
import type { IconProps } from '~/common';
import MessageEndpointIcon from './MessageEndpointIcon';
import { useAuthContext } from '~/hooks/AuthContext';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';
import RedHatLogo from '~/components/RedHatLogo';

type UserAvatarProps = {
  size: number;
  user?: TUser;
  avatarSrc: string;
  username: string;
  className?: string;
};

const UserAvatar = memo(({ size, user, avatarSrc, username, className }: UserAvatarProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const renderDefaultAvatar = () => (
    <div
      style={{
        width: size,
        height: size,
      }}
      className="relative flex items-center justify-center rounded-full"
    >
      <RedHatLogo size={size} style={{ borderRadius: '50%' }} />
    </div>
  );

  // Reset imageError when avatar changes
  React.useEffect(() => {
    setImageError(false);
  }, [user?.avatar, avatarSrc]);

  const hasAvatar = !!(user?.avatar ?? '') || !!avatarSrc;
  const shouldShowAvatar = hasAvatar && !imageError;

  return (
    <div
      title={username}
      style={{
        width: size,
        height: size,
      }}
      className={cn('relative flex items-center justify-center', className ?? '')}
    >
      {shouldShowAvatar ? (
        <img
          key={user?.avatar || avatarSrc}
          className="rounded-full"
          src={(user?.avatar ?? '') || avatarSrc}
          alt="avatar"
          onError={handleImageError}
        />
      ) : (
        renderDefaultAvatar()
      )}
    </div>
  );
});

UserAvatar.displayName = 'UserAvatar';

const Icon: React.FC<IconProps> = memo((props) => {
  const { user } = useAuthContext();
  const { size = 30, isCreatedByUser } = props;

  const avatarSrc = useAvatar(user);
  const localize = useLocalize();

  if (isCreatedByUser) {
    const username = user?.name ?? user?.username ?? localize('com_nav_user');
    return (
      <UserAvatar
        size={size}
        user={user}
        avatarSrc={avatarSrc}
        username={username}
        className={props.className}
      />
    );
  }
  return <MessageEndpointIcon {...props} />;
});

Icon.displayName = 'Icon';

export default Icon;
