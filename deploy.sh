#!/bin/bash

# ----------------------------------------------------------------
# Script for deploying the Ocean Prime website via Git
#
# How it works:
# 1. Pushes local changes to the Git repository.
# 2. Connects to the server and runs 'git pull'.
# 3. Rebuilds and restarts the Docker containers.
#
# Usage:
# ./deploy.sh
# (The script will ask for a commit message)
# ----------------------------------------------------------------

# --- SETTINGS ---
# User and address of your server
REMOTE_USER="deployer" # Using a non-root user is a security best practice
REMOTE_HOST="109.196.102.71"

# Path to the website folder ON THE SERVER
REMOTE_PATH="/var/www/ocean-prime"

# --- SCRIPT CODE ---

# Exit if any command fails
set -e

# 1. Ask the user for a commit message
read -p "💬  Enter a commit message: " COMMIT_MESSAGE

# Check that the message is not empty
if [ -z "$COMMIT_MESSAGE" ]; then
    echo # Newline for nice output
    echo "🛑 Error: The commit message cannot be empty."
    exit 1
fi

# 2. Add and push changes to GitHub
echo "⚙️  Step 1: Pushing changes to Git..."
git add .
git commit -m "$COMMIT_MESSAGE"
git push origin main # If your branch is master, change main to master

echo "✅  Code successfully pushed to Git."

# 3. Connect to the server and download updates
echo "🚚  Step 2: Updating files on the server..."

# Form one large command to run on the server.
REMOTE_COMMANDS='
  cd ${REMOTE_PATH} && \
  echo "--- 1. Getting the latest changes from Git" && \
  git fetch origin main && \
  git reset --hard origin/main && \
  echo "--- 2. Rebuilding and restarting Docker containers" && \
  docker compose up -d --build && \
  echo "✅  Deployment of the code is complete."
'

# Explicitly specify the path to the private key to avoid ambiguity
# The -i flag tells SSH which identity file (private key) to use.
# The tilde (~) must be outside of quotes to be expanded to your home directory.
IDENTITY_FILE=~/.ssh/id_ed25519

ssh -i "${IDENTITY_FILE}" "${REMOTE_USER}@${REMOTE_HOST}" "${REMOTE_COMMANDS}"

echo

echo "🎉  Deployment successfully completed!"

echo
