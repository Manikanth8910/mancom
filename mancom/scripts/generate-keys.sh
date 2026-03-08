#!/bin/bash

# Generate RS256 key pair for JWT signing
# Run from repository root: ./scripts/generate-keys.sh

set -e

KEYS_DIR="./keys"

echo "Generating RS256 key pair for JWT..."

# Create keys directory if it doesn't exist
mkdir -p "$KEYS_DIR"

# Check if keys already exist
if [ -f "$KEYS_DIR/private.pem" ] || [ -f "$KEYS_DIR/public.pem" ]; then
    echo ""
    echo "Warning: Keys already exist in $KEYS_DIR"
    read -p "Overwrite existing keys? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
fi

# Generate private key (2048-bit RSA)
openssl genrsa -out "$KEYS_DIR/private.pem" 2048

# Extract public key from private key
openssl rsa -in "$KEYS_DIR/private.pem" -pubout -out "$KEYS_DIR/public.pem"

# Set restrictive permissions on private key
chmod 600 "$KEYS_DIR/private.pem"
chmod 644 "$KEYS_DIR/public.pem"

echo ""
echo "Keys generated successfully:"
echo "  Private key: $KEYS_DIR/private.pem"
echo "  Public key:  $KEYS_DIR/public.pem"
echo ""
echo "Add to your .env file:"
echo "  JWT_PRIVATE_KEY_PATH=./keys/private.pem"
echo "  JWT_PUBLIC_KEY_PATH=./keys/public.pem"
echo ""
echo "IMPORTANT: Never commit private.pem to version control!"
