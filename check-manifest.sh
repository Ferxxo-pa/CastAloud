#!/bin/bash
echo "Testing manifest endpoints..."
echo "1. Testing /.well-known/farcaster.json:"
curl -s -H "Accept: application/json" https://castaloud.replit.app/.well-known/farcaster.json | head -3
echo ""
echo "2. Testing /manifest.json:"
curl -s -H "Accept: application/json" https://castaloud.replit.app/manifest.json | head -3