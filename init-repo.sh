#!/bin/bash

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Keyword clustering package"

# Copy example .env file
cp .env.example .env

echo "Repository initialized successfully!"
echo "Please edit the .env file to add your OpenAI API key."
echo ""
echo "To build the package:"
echo "  npm run build"
echo ""
echo "To run tests:"
echo "  npm test"
echo ""
echo "To run examples (after adding your API key to .env):"
echo "  npm run example:basic"
echo "  npm run example:chat"
echo "  npm run example:tasks"