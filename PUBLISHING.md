# Publishing Guide

This document explains how to set up automatic publishing of this package to npm using GitHub Actions.

## Prerequisites

1. A GitHub repository for this package
2. An npm account with publishing rights
3. GitHub repository access to add secrets

## Setup Steps

### 1. Create an npm Access Token

1. Log in to your npm account at [npmjs.com](https://www.npmjs.com/)
2. Go to your profile settings
3. Select "Access Tokens"
4. Click "Generate New Token"
5. Select "Publish" as the token type
6. Copy the generated token (you won't be able to see it again)

### 2. Add the npm Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to "Settings" > "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Paste the npm token you generated
6. Click "Add secret"

### 3. Push Your Code to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add remote repository
git remote add origin https://github.com/yourusername/clusterkw.git

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Push to GitHub
git push -u origin main
```

### 4. Manual Publishing (if needed)

If you need to publish manually:

```bash
# Log in to npm (if not already logged in)
npm login

# Build the package
npm run build

# Publish to npm
npm publish
```

## Workflow Details

### Automatic Publishing

The package will be automatically published to npm when:

1. Changes to `package.json` are pushed to the main branch
2. A new GitHub Release is created
3. The publish workflow is manually triggered from GitHub Actions

### Version Bumping

You can use the GitHub Actions workflow to bump the version:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Version Bump" workflow
3. Click "Run workflow"
4. Choose the version type (patch, minor, major) or enter a custom version
5. Click "Run workflow"

This will:
1. Update the version in package.json
2. Create a git tag for the new version
3. Push the changes to GitHub
4. Trigger the publish workflow (if on the main branch)