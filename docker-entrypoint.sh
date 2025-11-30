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
    if command -v runuser >/dev/null 2>&1 && runuser -u 1001 -- id >/dev/null 2>&1; then
        exec runuser -u 1001 -- "$@"
    elif command -v su >/dev/null 2>&1; then
        # Use su with correct syntax: su -s shell user -c "command"
        # Pass all arguments correctly using sh -c with proper quoting
        exec su -s /bin/bash 1001 sh -c "exec \"\$@\"" sh "$@"
    else
        # Can't switch, run as root
        exec "$@"
    fi
else
    # User doesn't exist - run as root
    # This is acceptable for containers where security is handled at the container level
    exec "$@"
fi

