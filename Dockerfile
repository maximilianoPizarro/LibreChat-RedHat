# v0.8.1-rc2

# Base Red Hat UBI8 image with Node.js
FROM registry.access.redhat.com/ubi8/nodejs-20:latest AS node

# Add Tech-Preview label
LABEL tech-preview="true"
LABEL description="Red Hat Chat - Tech Preview"

# Ensure we're running as root for package installation
USER root

# Install python3 (as root)
# Note: jemalloc is not available in UBI8 repos, so we skip it
# The application will work fine without jemalloc (it's just a memory optimization)
RUN dnf install -y python3 python3-pip && \
    dnf clean all

# jemalloc is not available in UBI8 repos, so LD_PRELOAD is not set
# The application will use the default memory allocator

# Install uv for extended MCP support (as root)
# Copy uv binary from official image instead of using pip (which doesn't have uv)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/
RUN uv --version || echo "Warning: uv installation check failed, but continuing..."

# Create app directory and set permissions (as root)
# Create user 1001 (for UBI8 compatibility)
# Create volume mount points early for better cache usage
RUN mkdir -p /app && \
    (getent group 1001 >/dev/null 2>&1 || groupadd -r -g 1001 appgroup) && \
    (getent passwd 1001 >/dev/null 2>&1 || useradd -r -u 1001 -g 1001 -d /app -s /bin/bash appuser) && \
    mkdir -p /app/client/public/images /app/api/logs /app/uploads && \
    chown -R 1001:1001 /app && \
    chmod -R 775 /app/client/public/images /app/api/logs /app/uploads

WORKDIR /app

# Copy entrypoint script for fixing permissions (as root)
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && \
    chown root:root /usr/local/bin/docker-entrypoint.sh

# Keep as root for entrypoint to fix permissions, then switch to 1001 in the script
USER root

COPY --chown=1001:1001 package.json package-lock.json ./
COPY --chown=1001:1001 api/package.json ./api/package.json
COPY --chown=1001:1001 client/package.json ./client/package.json
COPY --chown=1001:1001 packages/data-provider/package.json ./packages/data-provider/package.json
COPY --chown=1001:1001 packages/data-schemas/package.json ./packages/data-schemas/package.json
COPY --chown=1001:1001 packages/api/package.json ./packages/api/package.json

RUN \
    # Allow mounting of these files, which have no default
    touch .env ; \
    # Directories for volumes already created above with correct permissions
    npm config set fetch-retry-maxtimeout 600000 ; \
    npm config set fetch-retries 5 ; \
    npm config set fetch-retry-mintimeout 15000 ; \
    npm install --no-audit --legacy-peer-deps

COPY --chown=1001:1001 . .

RUN \
    # React client build
    NODE_OPTIONS="--max-old-space-size=2048" npm run frontend; \
    npm prune --production; \
    npm cache clean --force

# Node API setup
EXPOSE 3080
ENV HOST=0.0.0.0
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "backend"]

# Optional: for client with nginx routing
# FROM nginx:stable-alpine AS nginx-client
# WORKDIR /usr/share/nginx/html
# COPY --from=node /app/client/dist /usr/share/nginx/html
# COPY client/nginx.conf /etc/nginx/conf.d/default.conf
# ENTRYPOINT ["nginx", "-g", "daemon off;"]
