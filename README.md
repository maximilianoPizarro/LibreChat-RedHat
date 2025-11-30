<p align="center">
  <a href="https://www.redhat.com">
    <img src="client/public/assets/logo.svg" height="256">
  </a>
  <h1 align="center">
    <a href="https://www.redhat.com">Red Hat Chat</a>
  </h1>
  <p align="center">
    <img src="https://img.shields.io/badge/Status-Tech--Preview-orange?style=for-the-badge" alt="Tech Preview">
  </p>
  <p align="center">
    <em>Powered by LibreChat with Red Hat Design System</em>
  </p>
</p>

<p align="center">
  <a href="https://discord.librechat.ai"> 
    <img
      src="https://img.shields.io/discord/1086345563026489514?label=&logo=discord&style=for-the-badge&logoWidth=20&logoColor=white&labelColor=000000&color=blueviolet">
  </a>
  <a href="https://www.youtube.com/@LibreChat"> 
    <img
      src="https://img.shields.io/badge/YOUTUBE-red.svg?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&logoWidth=20">
  </a>
  <a href="https://docs.librechat.ai"> 
    <img
      src="https://img.shields.io/badge/DOCS-blue.svg?style=for-the-badge&logo=read-the-docs&logoColor=white&labelColor=000000&logoWidth=20">
  </a>
  <a aria-label="Sponsors" href="https://github.com/sponsors/danny-avila">
    <img
      src="https://img.shields.io/badge/SPONSORS-brightgreen.svg?style=for-the-badge&logo=github-sponsors&logoColor=white&labelColor=000000&logoWidth=20">
  </a>
</p>

<p align="center">
<a href="https://railway.app/template/b5k2mn?referralCode=HI9hWz">
  <img src="https://railway.app/button.svg" alt="Deploy on Railway" height="30">
</a>
<a href="https://zeabur.com/templates/0X2ZY8">
  <img src="https://zeabur.com/button.svg" alt="Deploy on Zeabur" height="30"/>
</a>
<a href="https://template.cloud.sealos.io/deploy?templateName=librechat">
  <img src="https://raw.githubusercontent.com/labring-actions/templates/main/Deploy-on-Sealos.svg" alt="Deploy on Sealos" height="30">
</a>
</p>

<p align="center">
  <a href="https://www.librechat.ai/docs/translation">
    <img 
      src="https://img.shields.io/badge/dynamic/json.svg?style=for-the-badge&color=2096F3&label=locize&query=%24.translatedPercentage&url=https://api.locize.app/badgedata/4cb2598b-ed4d-469c-9b04-2ed531a8cb45&suffix=%+translated" 
      alt="Translation Progress">
  </a>
</p>


# ✨ Features

- 🖥️ **UI & Experience** powered by [Red Hat Design System](https://ux.redhat.com/) with enhanced design and features

- 🤖 **AI Model Selection**:  
  - Anthropic (Claude), AWS Bedrock, OpenAI, Azure OpenAI, Google, Vertex AI, OpenAI Responses API (incl. Azure)
  - [Custom Endpoints](https://www.librechat.ai/docs/quick_start/custom_endpoints): Use any OpenAI-compatible API with LibreChat, no proxy required
  - Compatible with [Local & Remote AI Providers](https://www.librechat.ai/docs/configuration/librechat_yaml/ai_endpoints):
    - Ollama, groq, Cohere, Mistral AI, Apple MLX, koboldcpp, together.ai,
    - OpenRouter, Helicone, Perplexity, ShuttleAI, Deepseek, Qwen, and more

- 🔧 **[Code Interpreter API](https://www.librechat.ai/docs/features/code_interpreter)**: 
  - Secure, Sandboxed Execution in Python, Node.js (JS/TS), Go, C/C++, Java, PHP, Rust, and Fortran
  - Seamless File Handling: Upload, process, and download files directly
  - No Privacy Concerns: Fully isolated and secure execution

- 🔦 **Agents & Tools Integration**:  
  - **[LibreChat Agents](https://www.librechat.ai/docs/features/agents)**:
    - No-Code Custom Assistants: Build specialized, AI-driven helpers
    - Agent Marketplace: Discover and deploy community-built agents
    - Collaborative Sharing: Share agents with specific users and groups
    - Flexible & Extensible: Use MCP Servers, tools, file search, code execution, and more
    - Compatible with Custom Endpoints, OpenAI, Azure, Anthropic, AWS Bedrock, Google, Vertex AI, Responses API, and more
    - [Model Context Protocol (MCP) Support](https://modelcontextprotocol.io/clients#librechat) for Tools

- 🔍 **Web Search**:  
  - Search the internet and retrieve relevant information to enhance your AI context
  - Combines search providers, content scrapers, and result rerankers for optimal results
  - **Customizable Jina Reranking**: Configure custom Jina API URLs for reranking services
  - **[Learn More →](https://www.librechat.ai/docs/features/web_search)**

- 🪄 **Generative UI with Code Artifacts**:  
  - [Code Artifacts](https://youtu.be/GfTj7O4gmd0?si=WJbdnemZpJzBrJo3) allow creation of React, HTML, and Mermaid diagrams directly in chat

- 🎨 **Image Generation & Editing**
  - Text-to-image and image-to-image with [GPT-Image-1](https://www.librechat.ai/docs/features/image_gen#1--openai-image-tools-recommended)
  - Text-to-image with [DALL-E (3/2)](https://www.librechat.ai/docs/features/image_gen#2--dalle-legacy), [Stable Diffusion](https://www.librechat.ai/docs/features/image_gen#3--stable-diffusion-local), [Flux](https://www.librechat.ai/docs/features/image_gen#4--flux), or any [MCP server](https://www.librechat.ai/docs/features/image_gen#5--model-context-protocol-mcp)
  - Produce stunning visuals from prompts or refine existing images with a single instruction

- 💾 **Presets & Context Management**:  
  - Create, Save, & Share Custom Presets  
  - Switch between AI Endpoints and Presets mid-chat
  - Edit, Resubmit, and Continue Messages with Conversation branching  
  - Create and share prompts with specific users and groups
  - [Fork Messages & Conversations](https://www.librechat.ai/docs/features/fork) for Advanced Context control

- 💬 **Multimodal & File Interactions**:  
  - Upload and analyze images with Claude 3, GPT-4.5, GPT-4o, o1, Llama-Vision, and Gemini 📸  
  - Chat with Files using Custom Endpoints, OpenAI, Azure, Anthropic, AWS Bedrock, & Google 🗃️

- 🌎 **Multilingual UI**:
  - English, 中文 (简体), 中文 (繁體), العربية, Deutsch, Español, Français, Italiano
  - Polski, Português (PT), Português (BR), Русский, 日本語, Svenska, 한국어, Tiếng Việt
  - Türkçe, Nederlands, עברית, Català, Čeština, Dansk, Eesti, فارسی
  - Suomi, Magyar, Հայերեն, Bahasa Indonesia, ქართული, Latviešu, ไทย, ئۇيغۇرچە

- 🧠 **Reasoning UI**:  
  - Dynamic Reasoning UI for Chain-of-Thought/Reasoning AI models like DeepSeek-R1

- 🎨 **Customizable Interface**:  
  - Customizable Dropdown & Interface that adapts to both power users and newcomers

- 🗣️ **Speech & Audio**:  
  - Chat hands-free with Speech-to-Text and Text-to-Speech  
  - Automatically send and play Audio  
  - Supports OpenAI, Azure OpenAI, and Elevenlabs

- 📥 **Import & Export Conversations**:  
  - Import Conversations from LibreChat, ChatGPT, Chatbot UI  
  - Export conversations as screenshots, markdown, text, json

- 🔍 **Search & Discovery**:  
  - Search all messages/conversations

- 👥 **Multi-User & Secure Access**:
  - Multi-User, Secure Authentication with OAuth2, LDAP, & Email Login Support
  - Built-in Moderation, and Token spend tools

- ⚙️ **Configuration & Deployment**:  
  - Configure Proxy, Reverse Proxy, Podman/Podman-Compose, & many Deployment options  
  - Use completely local or deploy on the cloud
  - Built with Red Hat certified container images (UBI8)

- 📖 **Open-Source & Community**:  
  - Completely Open-Source & Built in Public  
  - Community-driven development, support, and feedback

[For a thorough review of our features, see our docs here](https://docs.librechat.ai/) 📚

## 🪶 All-In-One AI Conversations with Red Hat Chat

Red Hat Chat brings together the future of assistant AIs with the revolutionary technology of OpenAI's ChatGPT, styled with the [Red Hat Design System](https://ux.redhat.com/). This application integrates multiple AI models while maintaining Red Hat's design standards and visual identity. It includes features such as conversation and message search, prompt templates and plugins.

With Red Hat Chat, you no longer need to opt for ChatGPT Plus and can instead use free or pay-per-call APIs. Built on Red Hat certified infrastructure using Podman and UBI8 container images.

### 🎨 Red Hat Design System Integration

This application uses the [Red Hat Design System (RHDS)](https://ux.redhat.com/get-started/developers/installation/#npm) for consistent UI components and styling. The frontend is built with:

- **Red Hat Design System Elements** (`@rhds/elements@4.0.0`) - Web components following Red Hat design standards
- **Red Hat Design Tokens** - CSS variables for colors, spacing, typography, and more
- **Red Hat Icons** - Consistent iconography across the application

The design system is loaded via CDN (jsDelivr) for development, and can be configured to use the Red Hat CDN for production deployments on `*.redhat.com` domains.

[![Watch the video](https://raw.githubusercontent.com/LibreChat-AI/librechat.ai/main/public/images/changelog/v0.7.6.gif)](https://www.youtube.com/watch?v=ilfwGQtJNlI)

Click on the thumbnail to open the video☝️

---

## 🚀 Quick Start with Podman

This application is configured to run with Podman and Podman-Compose, using Red Hat certified container images.

### Prerequisites

1. **Install Podman:**
   ```bash
   # RHEL/Fedora
   sudo dnf install podman
   
   # Ubuntu/Debian
   sudo apt-get install podman
   ```

2. **Install Podman-Compose:**
   ```bash
   pip3 install podman-compose
   ```

3. **Enable Podman socket (for rootless mode):**
   ```bash
   systemctl --user enable --now podman.socket
   export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/podman/podman.sock
   ```

### Running the Application

1. **Build and start services:**
   ```bash
   npm run start:podman
   # or directly:
   podman-compose -f ./podman-compose.yml up -d
   ```

2. **Stop services:**
   ```bash
   npm run stop:podman
   # or directly:
   podman-compose -f ./podman-compose.yml down
   ```

3. **Build container image:**
   ```bash
   npm run build:podman
   # or directly:
   podman build -t redhat-chat:latest -f Dockerfile .
   ```

### Container Images

- **Base Image:** `registry.access.redhat.com/ubi8/nodejs-20:latest` (Red Hat UBI8 with Node.js 20)
- **Container Runtime:** Podman (rootless support)
- **Compose Tool:** Podman-Compose

### Environment Variables

Create a `.env` file in the root directory with your configuration. See the original LibreChat documentation for required variables.

---

## 🚀 Open in Red Hat Developer Sandbox

You can quickly start developing Red Hat Chat directly in your browser using Red Hat Developer Sandbox (OpenShift DevSpaces).

[![Open in DevSpaces](https://img.shields.io/badge/Open%20in-DevSpaces-blue?style=for-the-badge&logo=openshift)](https://workspaces.openshift.com/f?url=https://github.com/maximilianoPizarro/LibreChat-RedHat)

### Using OpenShift DevSpaces

1. **Click the "Open in DevSpaces" button above** or visit:
   ```
   https://workspaces.openshift.com/f?url=https://github.com/maximilianoPizarro/LibreChat-RedHat
   ```

2. **Sign in** with your Red Hat Developer account (or create one for free)

3. **Wait for the workspace to initialize** - The devfile will automatically:
   - Start MongoDB, Meilisearch, VectorDB, and RAG API containers
   - Install dependencies
   - Start the API in development mode with `npm run backend:dev`

4. **Access the application**:
   - The API will be available on the exposed endpoint (usually port 3080)
   - All services are configured to communicate within the workspace network

### DevSpaces Features

- **Ephemeral Storage**: All data is stored in ephemeral volumes (data is lost when workspace stops)
- **Auto-configured Services**: MongoDB, Meilisearch, VectorDB, and RAG API start automatically
- **Development Mode**: API runs with hot-reload using `nodemon`
- **Pre-configured Environment**: All environment variables point to workspace containers

### Notes

- The workspace uses ephemeral storage - data will be lost when the workspace is stopped
- For persistent data, consider using OpenShift persistent volumes or external databases
- RAG API requires `OPENAI_API_KEY` to be set in the workspace environment variables

---

## 🚀 Deploy to OpenShift from DevSpaces Workspace

Deploy Red Hat Chat directly from your DevSpaces workspace to OpenShift using the Tekton pipeline.

### Prerequisites

- **Open workspace in DevSpaces** (see section above)
- **OpenShift cluster access** - Your DevSpaces workspace automatically has access to the OpenShift cluster
- **OpenShift CLI (`oc`)** - Available in DevSpaces workspace by default
- **Namespace** - Uses the current project/namespace from your workspace terminal (or set `OPENSHIFT_NAMESPACE` env var to override)

**Note**: If `oc` command is not available in your workspace, you can install it manually:
```bash
# In workspace terminal
curl -L https://mirror.openshift.com/pub/openshift-v4/clients/ocp/latest/openshift-client-linux.tar.gz | tar -xz -C /usr/local/bin/ oc
```

### Quick Deployment from Workspace

Once your workspace is running, open a terminal and run:

```bash
# Step 1: Setup deployment (creates namespace, secrets, manifests, pipeline)
devfile deploy-setup

# Step 2: Run the pipeline to build and deploy
devfile deploy-run

# Step 3: Expose the application
devfile deploy-expose

# Step 4: Check deployment status
devfile deploy-status
```

### Step-by-Step Deployment

#### Step 1: Setup Deployment

This command will:
- Create the namespace (if it doesn't exist)
- Generate and create secrets (JWT tokens, Meilisearch key)
- Apply base Kubernetes manifests
- Create the Tekton pipeline

```bash
devfile deploy-setup
```

**Note**: The commands automatically use the current OpenShift project/namespace from your workspace terminal. To use a different namespace, set the environment variable:
```bash
export OPENSHIFT_NAMESPACE=your-namespace
devfile deploy-setup
```

Or switch to a different project first:
```bash
oc project your-namespace
devfile deploy-setup
```

#### Step 2: Run Pipeline

Execute the Tekton pipeline to build the container image and deploy:

```bash
devfile deploy-run
```

This will:
- Create/update a BuildConfig with Docker strategy
- Build the container image in OpenShift's internal registry
- Copy the image from internal registry to quay.io using skopeo
- Apply Kubernetes manifests and deploy the application

**Monitor the pipeline:**
```bash
# In the workspace terminal
oc get pipelineruns -n $OPENSHIFT_NAMESPACE -w

# View specific pipeline logs
oc logs -f <pipelinerun-name> -n $OPENSHIFT_NAMESPACE
```

#### Step 3: Expose Application

Create a Route to expose the application:

```bash
devfile deploy-expose
```

This creates an OpenShift Route that makes the application accessible via HTTP/HTTPS.

#### Step 4: Check Status

Verify the deployment:

```bash
devfile deploy-status
```

This shows:
- Deployment status
- Running pods
- Route URL
- Pipeline execution status

### Accessing the Application

After deployment, get the application URL:

```bash
# Get route URL
oc get route redhat-chat -n $OPENSHIFT_NAMESPACE

# Or open directly in browser (if supported)
oc get route redhat-chat -n $OPENSHIFT_NAMESPACE -o jsonpath='{.spec.host}' | xargs -I {} echo "https://{}"
```

### Updating the Application

To update with new code:

1. **Push changes** to your Git repository
2. **Run the pipeline again**:
   ```bash
   devfile deploy-run
   ```
3. **Monitor the deployment**:
   ```bash
   devfile deploy-status
   ```

### Troubleshooting

**Check pipeline status:**
```bash
oc get pipelineruns -n $OPENSHIFT_NAMESPACE
oc describe pipelinerun <pipelinerun-name> -n $OPENSHIFT_NAMESPACE
```

**Check BuildConfig and builds:**
```bash
# View BuildConfig
oc get buildconfig redhat-chat -n $OPENSHIFT_NAMESPACE
oc describe buildconfig redhat-chat -n $OPENSHIFT_NAMESPACE

# View builds
oc get builds -n $OPENSHIFT_NAMESPACE -l buildconfig=redhat-chat
oc logs build/<build-name> -n $OPENSHIFT_NAMESPACE

# Check ImageStream
oc get imagestream redhat-chat -n $OPENSHIFT_NAMESPACE
```

**View application logs:**
```bash
oc logs -f deployment/redhat-chat -n $OPENSHIFT_NAMESPACE
```

**Check pod status:**
```bash
oc get pods -n $OPENSHIFT_NAMESPACE -l app=redhat-chat
oc describe pod <pod-name> -n $OPENSHIFT_NAMESPACE
```

**Verify secrets:**
```bash
oc get secrets -n $OPENSHIFT_NAMESPACE | grep redhat-chat
```

### Manual Commands (Alternative)

If you prefer to run commands manually:

```bash
# Get current namespace or use default
NAMESPACE=$(oc project -q || echo "${OPENSHIFT_NAMESPACE:-maximilianopizarro5-dev}")
oc project $NAMESPACE || oc create namespace $NAMESPACE

# Create secrets
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
MEILI_MASTER_KEY=$(openssl rand -hex 16)
oc create secret generic redhat-chat-secrets \
  --from-literal=jwt-secret=$JWT_SECRET \
  --from-literal=jwt-refresh-secret=$JWT_REFRESH_SECRET \
  --from-literal=meili-master-key=$MEILI_MASTER_KEY \
  -n $NAMESPACE

# Apply manifests
cd manifests/base && oc apply -k . -n $NAMESPACE && cd ../..

# Create pipeline
oc apply -f .tekton/pipeline.yaml -n $NAMESPACE

# Create and run PipelineRun (see Step 7 in manual section below)
```

---

## 🖥️ Deploy from Local Machine (Alternative)

If you prefer to deploy from your local machine instead of the DevSpaces workspace, follow these instructions.

### Prerequisites

1. **OpenShift CLI (`oc`) installed**:
   ```bash
   # Download from: https://mirror.openshift.com/pub/openshift-v4/clients/ocp/latest/
   ```

2. **Access to an OpenShift cluster** with:
   - Tekton Pipelines operator installed
   - Permissions to create namespaces, deployments, and pipelines
   - Access to push images to a container registry (e.g., quay.io)

3. **Container Registry credentials** (for pushing images):
   - Quay.io account or another container registry

### Step 1: Login to OpenShift

```bash
oc login --server=<your-openshift-server-url>
```

### Step 2: Create and Switch to Namespace

```bash
# Create namespace (replace with your namespace)
export NAMESPACE=maximilianopizarro5-dev
oc create namespace $NAMESPACE
oc project $NAMESPACE
```

### Step 3: Create Secrets

Create secrets for JWT tokens and Meilisearch master key:

```bash
# Generate secure keys
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
MEILI_MASTER_KEY=$(openssl rand -hex 16)

# Create secret
oc create secret generic redhat-chat-secrets \
  --from-literal=jwt-secret=$JWT_SECRET \
  --from-literal=jwt-refresh-secret=$JWT_REFRESH_SECRET \
  --from-literal=meili-master-key=$MEILI_MASTER_KEY \
  -n $NAMESPACE
```

**Optional**: If using RAG API, add OpenAI API key:

```bash
oc create secret generic redhat-chat-secrets \
  --from-literal=openai-api-key=<your-openai-api-key> \
  --dry-run=client -o yaml | oc apply -f - -n $NAMESPACE
```

### Step 4: Configure Quay.io Credentials (Optional)

The pipeline uses skopeo to copy images from OpenShift's internal registry to quay.io. If you need to push to quay.io, configure credentials:

```bash
# Create quay.io secret (optional - skopeo may use existing docker config)
oc create secret docker-registry quay-registry-secret \
  --docker-server=quay.io \
  --docker-username=<your-username> \
  --docker-password=<your-password> \
  --docker-email=<your-email> \
  -n $NAMESPACE

# Link secret to pipeline service account
oc secrets link pipeline quay-registry-secret -n $NAMESPACE
```

**Note**: The pipeline first builds to OpenShift's internal registry, then copies to quay.io. Internal registry access is automatic.

### Step 5: Apply Base Manifests

Deploy the base Kubernetes resources using Kustomize:

```bash
# Update namespace in kustomization.yaml if needed
cd manifests/base

# Apply manifests
oc apply -k . -n $NAMESPACE

# Or manually apply each file
oc apply -f serviceaccount.yaml -n $NAMESPACE
oc apply -f configmap.yaml -n $NAMESPACE
oc apply -f service.yaml -n $NAMESPACE
oc apply -f deployment.yaml -n $NAMESPACE
```

### Step 6: Create Tekton Pipeline

Create the Tekton pipeline:

```bash
# Apply pipeline
oc apply -f .tekton/pipeline.yaml -n $NAMESPACE

# Verify pipeline was created
oc get pipeline -n $NAMESPACE
```

### Step 7: Create PipelineRun

Create a PipelineRun to execute the pipeline:

```bash
# Create PipelineRun
cat <<EOF | oc apply -f -
apiVersion: tekton.dev/v1beta1
kind: PipelineRun
metadata:
  name: redhat-chat-pipeline-run-$(date +%s)
  namespace: $NAMESPACE
spec:
  pipelineRef:
    name: redhat-chat-pipeline
  params:
    - name: git-url
      value: https://github.com/maximilianoPizarro/LibreChat-RedHat
    - name: git-revision
      value: main
    - name: image-registry
      value: quay.io
    - name: image-repository
      value: maximilianopizarro/redhat-chat
    - name: image-tag
      value: latest
    - name: namespace
      value: $NAMESPACE
  workspaces:
    - name: source
      volumeClaimTemplate:
        spec:
          accessModes:
            - ReadWriteOnce
          resources:
            requests:
              storage: 1Gi
    - name: dockerconfig
      secret:
        secretName: quay-registry-secret
EOF
```

### Step 8: Monitor Pipeline Execution

Watch the pipeline execution:

```bash
# List PipelineRuns
oc get pipelineruns -n $NAMESPACE

# Watch pipeline logs
oc get pipelineruns -n $NAMESPACE -w

# View specific PipelineRun details
oc describe pipelinerun <pipelinerun-name> -n $NAMESPACE

# View task logs
oc logs -f <taskrun-name> -n $NAMESPACE
```

### Step 9: Expose the Application

Create a Route to expose the application:

```bash
# Create route
oc expose service redhat-chat -n $NAMESPACE

# Get route URL
oc get route redhat-chat -n $NAMESPACE

# Or create route manually with custom hostname
cat <<EOF | oc apply -f -
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: redhat-chat
  namespace: $NAMESPACE
spec:
  to:
    kind: Service
    name: redhat-chat
  port:
    targetPort: http
  tls:
    termination: edge
    insecureEdgeTerminationPolicy: Redirect
EOF
```

### Step 10: Verify Deployment

Check that all resources are running:

```bash
# Check deployment status
oc get deployment redhat-chat -n $NAMESPACE
oc rollout status deployment/redhat-chat -n $NAMESPACE

# Check pods
oc get pods -n $NAMESPACE -l app=redhat-chat

# Check services
oc get svc -n $NAMESPACE

# View application logs
oc logs -f deployment/redhat-chat -n $NAMESPACE
```

### Updating the Application

To update the application with new code:

1. **Push code changes** to your Git repository
2. **Create a new PipelineRun** (same as Step 7) or use a webhook trigger
3. **Monitor the pipeline** execution (Step 8)
4. **Verify the new deployment** (Step 10)

### Troubleshooting

**Pipeline fails to build:**
```bash
# Check BuildConfig
oc get buildconfig redhat-chat -n $NAMESPACE
oc describe buildconfig redhat-chat -n $NAMESPACE

# Check build logs
oc get builds -n $NAMESPACE -l buildconfig=redhat-chat
oc logs build/<build-name> -n $NAMESPACE

# Check pipeline task logs
oc logs -f <build-taskrun-name> -n $NAMESPACE

# Verify Dockerfile exists in repository
oc get pipeline redhat-chat-pipeline -n $NAMESPACE -o yaml
```

**Image copy to quay.io fails:**
```bash
# Check if skopeo is available in the task
oc logs -f <copy-to-quay-taskrun-name> -n $NAMESPACE

# Verify quay.io credentials
oc get secret quay-registry-secret -n $NAMESPACE

# Check ImageStream exists
oc get imagestream redhat-chat -n $NAMESPACE
```

**Deployment fails:**
```bash
# Check deployment events
oc describe deployment redhat-chat -n $NAMESPACE

# Check pod logs
oc logs <pod-name> -n $NAMESPACE

# Check if secrets exist
oc get secrets -n $NAMESPACE
```

**Image pull errors:**
```bash
# Verify image exists in registry
podman pull quay.io/maximilianopizarro/redhat-chat:latest

# Check image pull secrets
oc get secrets -n $NAMESPACE | grep registry
```

### Cleanup

To remove all resources:

```bash
# Delete namespace (removes everything)
oc delete namespace $NAMESPACE

# Or delete resources individually
oc delete -f .tekton/pipeline.yaml -n $NAMESPACE
oc delete -k manifests/base/ -n $NAMESPACE
oc delete secret redhat-chat-secrets -n $NAMESPACE
```

---

## 🌐 Resources

**Red Hat Resources:**
  - **Red Hat Design System:** [ux.redhat.com](https://ux.redhat.com/)
  - **Red Hat UBI:** [developers.redhat.com/products/rhel/ubi](https://developers.redhat.com/products/rhel/ubi)
  - **Podman:** [podman.io](https://podman.io/)

**Original LibreChat Resources:**
  - **GitHub Repo:** [github.com/danny-avila/LibreChat](https://github.com/danny-avila/LibreChat)
  - **RAG API:** [github.com/danny-avila/rag_api](https://github.com/danny-avila/rag_api)
  - **Website:** [librechat.ai](https://librechat.ai)
  - **Documentation:** [librechat.ai/docs](https://librechat.ai/docs)

---

## 📝 Changelog

Keep up with the latest updates by visiting the releases page and notes:
- [Releases](https://github.com/danny-avila/LibreChat/releases)
- [Changelog](https://www.librechat.ai/changelog) 

**⚠️ Please consult the [changelog](https://www.librechat.ai/changelog) for breaking changes before updating.**

---

## ⭐ Star History

<p align="center">
  <a href="https://star-history.com/#danny-avila/LibreChat&Date">
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=danny-avila/LibreChat&type=Date&theme=dark" onerror="this.src='https://api.star-history.com/svg?repos=danny-avila/LibreChat&type=Date'" />
  </a>
</p>
<p align="center">
  <a href="https://trendshift.io/repositories/4685" target="_blank" style="padding: 10px;">
    <img src="https://trendshift.io/api/badge/repositories/4685" alt="danny-avila%2FLibreChat | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/>
  </a>
  <a href="https://runacap.com/ross-index/q1-24/" target="_blank" rel="noopener" style="margin-left: 20px;">
    <img style="width: 260px; height: 56px" src="https://runacap.com/wp-content/uploads/2024/04/ROSS_badge_white_Q1_2024.svg" alt="ROSS Index - Fastest Growing Open-Source Startups in Q1 2024 | Runa Capital" width="260" height="56"/>
  </a>
</p>

---

## ✨ Contributions

Contributions, suggestions, bug reports and fixes are welcome!

For new features, components, or extensions, please open an issue and discuss before sending a PR.

If you'd like to help translate Red Hat Chat into your language, we'd love your contribution! Improving our translations not only makes the application more accessible to users around the world but also enhances the overall user experience. Please check out the [Translation Guide](https://www.librechat.ai/docs/translation).

### Red Hat Design System Contributions

When contributing UI components or styling changes, please ensure they follow the [Red Hat Design System guidelines](https://ux.redhat.com/). All components should use RHDS elements and tokens for consistency.

---

## 💖 This project exists in its current state thanks to all the people who contribute

<a href="https://github.com/danny-avila/LibreChat/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=danny-avila/LibreChat" />
</a>

---

## 🎉 Special Thanks

We thank [Locize](https://locize.com) for their translation management tools that support multiple languages in LibreChat.

<p align="center">
  <a href="https://locize.com" target="_blank" rel="noopener noreferrer">
    <img src="https://github.com/user-attachments/assets/d6b70894-6064-475e-bb65-92a9e23e0077" alt="Locize Logo" height="50">
  </a>
</p>
