#!/bin/bash

# Get tenant parameter
TENANT=$1

if [ -z "$TENANT" ]; then
    echo "❌ Error: Please provide a tenant name"
    echo "Usage: ./scripts/build-tenant.sh <tenant>"
    echo "Example: ./scripts/build-tenant.sh exopek"
    exit 1
fi

# Check if .env file exists for the tenant
ENV_FILE=".env.$TENANT"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: Environment file $ENV_FILE does not exist"
    exit 1
fi

echo "🚀 Building for tenant: $TENANT"
echo "📄 Using environment file: $ENV_FILE"

# Execute the build command with the correct environment file
node -r dotenv/config ./node_modules/.bin/nuxt build dotenv_config_path="$ENV_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully for tenant: $TENANT"
else
    echo "❌ Build failed for tenant: $TENANT"
    exit 1
fi