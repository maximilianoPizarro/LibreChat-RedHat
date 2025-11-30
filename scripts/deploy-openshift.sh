#!/bin/bash
# Deploy Red Hat Chat to OpenShift using Tekton Pipeline
# Usage: ./scripts/deploy-openshift.sh [namespace]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default namespace
NAMESPACE=${1:-maximilianopizarro5-dev}

echo -e "${GREEN}🚀 Deploying Red Hat Chat to OpenShift${NC}"
echo -e "${YELLOW}Namespace: ${NAMESPACE}${NC}"

# Check if oc is installed
if ! command -v oc &> /dev/null; then
    echo -e "${RED}Error: oc (OpenShift CLI) is not installed${NC}"
    echo "Download from: https://mirror.openshift.com/pub/openshift-v4/clients/ocp/latest/"
    exit 1
fi

# Check if logged in to OpenShift
if ! oc whoami &> /dev/null; then
    echo -e "${RED}Error: Not logged in to OpenShift${NC}"
    echo "Run: oc login --server=<your-openshift-server-url>"
    exit 1
fi

echo -e "${GREEN}✓ OpenShift CLI configured${NC}"

# Step 1: Create namespace
echo -e "\n${YELLOW}Step 1: Creating namespace...${NC}"
if oc get namespace $NAMESPACE &> /dev/null; then
    echo -e "${GREEN}✓ Namespace ${NAMESPACE} already exists${NC}"
else
    oc create namespace $NAMESPACE
    echo -e "${GREEN}✓ Namespace ${NAMESPACE} created${NC}"
fi
oc project $NAMESPACE

# Step 2: Create secrets
echo -e "\n${YELLOW}Step 2: Creating secrets...${NC}"
if oc get secret redhat-chat-secrets -n $NAMESPACE &> /dev/null; then
    echo -e "${GREEN}✓ Secret redhat-chat-secrets already exists${NC}"
else
    # Generate secure keys
    JWT_SECRET=$(openssl rand -hex 32)
    JWT_REFRESH_SECRET=$(openssl rand -hex 32)
    MEILI_MASTER_KEY=$(openssl rand -hex 16)
    
    oc create secret generic redhat-chat-secrets \
        --from-literal=jwt-secret=$JWT_SECRET \
        --from-literal=jwt-refresh-secret=$JWT_REFRESH_SECRET \
        --from-literal=meili-master-key=$MEILI_MASTER_KEY \
        -n $NAMESPACE
    
    echo -e "${GREEN}✓ Secret redhat-chat-secrets created${NC}"
fi

# Step 3: Check for registry secret
echo -e "\n${YELLOW}Step 3: Checking container registry credentials...${NC}"
if oc get secret quay-registry-secret -n $NAMESPACE &> /dev/null; then
    echo -e "${GREEN}✓ Registry secret exists${NC}"
    oc secrets link pipeline quay-registry-secret -n $NAMESPACE || true
else
    echo -e "${YELLOW}⚠ Registry secret not found. You may need to create it:${NC}"
    echo "oc create secret docker-registry quay-registry-secret \\"
    echo "  --docker-server=quay.io \\"
    echo "  --docker-username=<your-username> \\"
    echo "  --docker-password=<your-password> \\"
    echo "  --docker-email=<your-email> \\"
    echo "  -n $NAMESPACE"
fi

# Step 4: Apply base manifests
echo -e "\n${YELLOW}Step 4: Applying base manifests...${NC}"
cd manifests/base
oc apply -k . -n $NAMESPACE
cd ../..
echo -e "${GREEN}✓ Base manifests applied${NC}"

# Step 5: Create pipeline
echo -e "\n${YELLOW}Step 5: Creating Tekton pipeline...${NC}"
oc apply -f .tekton/pipeline.yaml -n $NAMESPACE
echo -e "${GREEN}✓ Pipeline created${NC}"

# Step 6: Create PipelineRun
echo -e "\n${YELLOW}Step 6: Creating PipelineRun...${NC}"
PIPELINE_RUN_NAME="redhat-chat-pipeline-run-$(date +%s)"
cat <<EOF | oc apply -f -
apiVersion: tekton.dev/v1beta1
kind: PipelineRun
metadata:
  name: $PIPELINE_RUN_NAME
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
echo -e "${GREEN}✓ PipelineRun $PIPELINE_RUN_NAME created${NC}"

# Step 7: Expose route
echo -e "\n${YELLOW}Step 7: Creating route...${NC}"
if oc get route redhat-chat -n $NAMESPACE &> /dev/null; then
    echo -e "${GREEN}✓ Route already exists${NC}"
else
    oc expose service redhat-chat -n $NAMESPACE
    echo -e "${GREEN}✓ Route created${NC}"
fi

# Summary
echo -e "\n${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Deployment initiated!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Monitor pipeline: ${GREEN}oc get pipelineruns -n $NAMESPACE -w${NC}"
echo -e "2. Check deployment: ${GREEN}oc get deployment redhat-chat -n $NAMESPACE${NC}"
echo -e "3. View logs: ${GREEN}oc logs -f deployment/redhat-chat -n $NAMESPACE${NC}"
echo -e "4. Get route URL: ${GREEN}oc get route redhat-chat -n $NAMESPACE${NC}"
echo -e "\n${GREEN}PipelineRun: $PIPELINE_RUN_NAME${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"

