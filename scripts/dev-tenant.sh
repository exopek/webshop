#!/bin/bash

# Get tenant parameter
TENANT=$1

if [ -z "$TENANT" ]; then
    echo "❌ Error: Please provide a tenant name"
    echo "Usage: ./scripts/dev-tenant.sh <tenant>"
    echo "Example: ./scripts/dev-tenant.sh exopek"
    exit 1
fi

# Check if .env file exists for the tenant
ENV_FILE=".env.$TENANT"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: Environment file $ENV_FILE does not exist"
    exit 1
fi

echo "🚀 Starting dev server for tenant: $TENANT"
echo "📄 Using environment file: $ENV_FILE"

# Load environment variables and start dev server
export $(cat "$ENV_FILE" | xargs) && ./node_modules/.bin/nuxt dev