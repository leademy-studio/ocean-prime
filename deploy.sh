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

# 3. Synchronize files directly to the server using rsync
echo "🚚  Step 2: Synchronizing files with the server..."

# Path to the private key. The tilde (~) must be outside quotes to expand correctly.
IDENTITY_FILE=~/.ssh/id_ed25519

# rsync will copy local files to the server, excluding unnecessary ones.
# -a: archive mode (preserves permissions, ownership, etc.)
# -v: verbose (shows what's being copied)
# -z: compress file data during the transfer
# --exclude: folders to ignore
# -e: specifies the remote shell to use (our ssh command with the key)
rsync -avz \
  --exclude ".git" \
  --exclude ".idea" \
  --exclude "node_modules" \
  --exclude "vendor" \
  -e "ssh -i ${IDENTITY_FILE}" \
  ./ "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/"

echo "✅  Files successfully synchronized."

# 4. Connect to the server and restart Docker containers
echo "⚙️  Step 3: Rebuilding and restarting containers on the server..."

# The command now only needs to restart the services, as the files are already updated.
REMOTE_COMMANDS="
  cd ${REMOTE_PATH} && \
  docker compose up -d --build
"

ssh -i "${IDENTITY_FILE}" "${REMOTE_USER}@${REMOTE_HOST}" "${REMOTE_COMMANDS}"

echo

echo "🎉  Deployment successfully completed!"

echo
