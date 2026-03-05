#!/bin/bash

set -e

echo "📦 Building project..."
npm run build

echo "📦 Clearing assets folder in ../home-assignment..."
rm -rf ../home-assignment/assets

echo "📦 Copying dist to ../home-assignment..."
cp -r dist/* ../home-assignment/

echo "📦 Committing and pushing to obfuscated repo..."
cd ../home-assignment
git add .
git commit -m "Deploy: Publish obfuscated application build"
git push

echo "✅ Done!"
