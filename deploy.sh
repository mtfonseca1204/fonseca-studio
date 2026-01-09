#!/bin/bash
# Deploy script for Fonseca Studio

echo "📦 Adding all changes..."
git add -A

echo "💬 Enter commit message:"
read message

git commit -m "$message"

echo "🚀 Pushing to GitHub..."
git push origin main

echo "⚡ Triggering Vercel deployment..."
curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_ubdKFJSt8RMMJrBfnc1i24Nmokgp/SrnoIVhrYi"

echo ""
echo "✅ Done! Check https://fonseca.studio in a few minutes."

