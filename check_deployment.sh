#!/bin/bash
echo "Checking if .nojekyll exists..."
curl -s -o /dev/null -w "%{http_code}" "https://haerin.haikari.top/Haerin-Blog/.nojekyll"
echo ""

echo "Checking if CSS file is accessible..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://haerin.haikari.top/Haerin-Blog/_next/static/css/6ce73d35746563f6.css")
echo "HTTP Status: $STATUS"

if [ "$STATUS" = "200" ]; then
    echo "✓ Deployment successful! CSS file is accessible."
else
    echo "✗ Deployment issue. CSS file returns $STATUS"
fi
