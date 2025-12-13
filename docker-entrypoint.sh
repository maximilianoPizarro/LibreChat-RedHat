#!/bin/bash
# Don't use set -e here, we want to handle errors gracefully

# Fix permissions for mounted volumes (run as root)
# This ensures directories exist and have correct permissions

# Create directories if they don't exist and fix permissions
for dir in /app/api/logs /app/uploads /app/client/public/images; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir" 2>/dev/null || true
    fi
    # Fix ownership and permissions (use numeric ID, works even if user doesn't exist)
    chown -R 1001:1001 "$dir" 2>/dev/null || chown -R root:root "$dir" 2>/dev/null || true
    chmod -R 775 "$dir" 2>/dev/null || chmod -R 777 "$dir" 2>/dev/null || true
done

# Try to switch to user 1001 if it exists, otherwise run as root
if id -u 1001 >/dev/null 2>&1; then
    # User exists, try to switch to it
    if command -v runuser >/dev/null 2>&1; then
        # Try runuser first (preferred method)
        if runuser -u 1001 -- id >/dev/null 2>&1; then
            exec runuser -u 1001 -- "$@"
        else
            # runuser failed, fall back to root
            exec "$@"
        fi
    elif command -v su >/dev/null 2>&1; then
        # Use su with correct syntax - try to switch, but fall back to root on failure
        # Test if we can switch to the user first
        if su -s /bin/bash 1001 -c "id" >/dev/null 2>&1; then
            # User can be switched to, execute command as that user
            # Use sh -c to properly handle arguments
            exec su -s /bin/bash 1001 -c "exec \"\$@\"" -- sh "$@"
        else
            # su failed, run as root
            exec "$@"
        fi
    else
        # No user switching command available, run as root
        exec "$@"
    fi
else
    # User doesn't exist - run as root
    # This is acceptable for containers where security is handled at the container level
    exec "$@"
fi

