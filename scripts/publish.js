#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SOURCE_REPO = 'https://github.com/zs-varga/home-assignment-source.git';
const OBFUSCATED_REPO = 'https://github.com/zs-varga/home-assignment-obfuscated.git';
const TEMP_OBFUSCATED_DIR = path.join('/tmp', 'home-assignment-obfuscated');
const DIST_DIR = path.join(__dirname, '..', 'dist');
const PROJECT_ROOT = path.join(__dirname, '..');

function log(message) {
  console.log(`\n📦 ${message}`);
}

function error(message) {
  console.error(`\n❌ ERROR: ${message}`);
  process.exit(1);
}

function exec(command, options = {}) {
  try {
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (err) {
    error(`Command failed: ${command}`);
  }
}

function execSilent(command) {
  try {
    return execSync(command, { stdio: 'pipe', encoding: 'utf8' }).trim();
  } catch (err) {
    return '';
  }
}

async function publish() {
  log('Starting build and publish process...');

  // Step 1: Build the project
  log('Step 1: Building project with obfuscation...');
  process.chdir(PROJECT_ROOT);
  exec('npm run build');

  if (!fs.existsSync(DIST_DIR)) {
    error('Build failed - dist folder not found');
  }
  log('✅ Build successful');

  // Step 2: Commit and push to source repository
  log('Step 2: Committing to source repository...');

  // Check if there are changes to commit
  const status = execSilent('git status --porcelain');
  if (status) {
    exec('git add .');
    exec('git commit -m "Build: Generate obfuscated assets"');
    exec('git push origin main');
    log('✅ Pushed to source repository');
  } else {
    log('ℹ️  No changes to commit in source repository');
  }

  // Step 3: Prepare obfuscated repository
  log('Step 3: Preparing obfuscated repository...');

  // Clean up temp directory if it exists
  if (fs.existsSync(TEMP_OBFUSCATED_DIR)) {
    execSilent(`rm -rf "${TEMP_OBFUSCATED_DIR}"`);
  }

  // Clone or initialize the obfuscated repo
  const repoExists = execSilent(`git ls-remote ${OBFUSCATED_REPO} 2>/dev/null`);

  if (repoExists) {
    log('Cloning existing obfuscated repository...');
    exec(`git clone ${OBFUSCATED_REPO} "${TEMP_OBFUSCATED_DIR}"`);
  } else {
    error(`Obfuscated repository not found. Please create it first: ${OBFUSCATED_REPO}`);
  }

  // Step 4: Copy only the dist files to the obfuscated repo
  log('Step 4: Copying obfuscated files...');

  // Clear existing content (except .git)
  const obfuscatedDir = TEMP_OBFUSCATED_DIR;
  const files = fs.readdirSync(obfuscatedDir);
  for (const file of files) {
    if (file !== '.git') {
      execSilent(`rm -rf "${path.join(obfuscatedDir, file)}"`);
    }
  }

  // Copy dist contents
  const distFiles = fs.readdirSync(DIST_DIR);
  for (const file of distFiles) {
    execSilent(`cp -r "${path.join(DIST_DIR, file)}" "${path.join(obfuscatedDir, file)}"`);
  }

  log('✅ Files copied to obfuscated repository');

  // Step 5: Create minimal README for obfuscated repo
  log('Step 5: Creating obfuscated repository README...');

  const readmeContent = `# Medication Validation Application

Live application: [Open Application](./index.html)

## About This Repository

This repository contains the obfuscated and minified production build of the Medication Validation Application. The source code is not included in this repository.

For source code and development, see: https://github.com/zs-varga/home-assignment-source

## Features

- Medication validation
- Dosage validation with unit conversion
- Frequency validation
- Date of birth validation and age calculation
- Weight validation with unit support
- Responsive form interface

## Running Locally

Simply open \`index.html\` in a web browser. No build process needed.

## Deployment

This repository is configured for GitHub Pages deployment.
`;

  fs.writeFileSync(path.join(obfuscatedDir, 'README.md'), readmeContent);

  // Step 6: Create .gitignore
  log('Step 6: Setting up .gitignore...');

  const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db

# Build source (should never be here)
src/
vite.config.js
package.json
package-lock.json
eslint.config.js
tsconfig*
*.test.js
`;

  fs.writeFileSync(path.join(obfuscatedDir, '.gitignore'), gitignoreContent);

  log('✅ Repository configured');

  // Step 7: Commit and push to obfuscated repository
  log('Step 7: Committing to obfuscated repository...');

  process.chdir(obfuscatedDir);

  const obfuscatedStatus = execSilent('git status --porcelain');
  if (obfuscatedStatus) {
    exec('git add .');
    exec('git commit -m "Deploy: Publish obfuscated application build"');
    exec('git push origin main');
    log('✅ Pushed to obfuscated repository');
  } else {
    log('ℹ️  No changes in obfuscated repository');
  }

  // Step 8: Cleanup
  log('Step 8: Cleaning up temporary files...');
  process.chdir(PROJECT_ROOT);
  execSilent(`rm -rf "${TEMP_OBFUSCATED_DIR}"`);

  log('Step 9: Done!');
  console.log(`
✅ Publish process completed successfully!

📊 Summary:
  • Source code committed to: ${SOURCE_REPO}
  • Obfuscated build pushed to: ${OBFUSCATED_REPO}
  • GitHub Pages will serve the obfuscated version

🔍 Verification:
  • Check source repo: https://github.com/zs-varga/home-assignment-source
  • Check obfuscated repo: https://github.com/zs-varga/home-assignment-obfuscated
  • Enable GitHub Pages in obfuscated repo settings
  `);
}

publish().catch((err) => {
  error(err.message);
});
